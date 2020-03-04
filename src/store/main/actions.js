import { Cookies } from 'quasar'
import axios from 'axios'
import * as getters from './getters'

import { LocalStorage } from 'quasar'

export async function retrieveUser(context) {
    var userRes = await axios.get('/user');
    if (!userRes.data.user) {
      Cookies.remove('jwt_token');
      context.commit('setUser', null);
    } else {
      context.commit('setUser', userRes.data.user);
      const services = userRes.data.services;
      LocalStorage.set('services', services);
      context.commit('setServices', services);
      return userRes.data
    }
}

export async function retrieveServices(context) {
    console.log(context);
    const services = await axios.get('/user');
    LocalStorage.set('services', services.data.services);
    context.commit('setServices', services.data.services);
    return services.data.services
}

export async function logoutUser(context) {
    Cookies.remove('jwt_token');
    Cookies.remove('services')
    context.commit('setUser', null);
}

export async function loadUser(context) {
  return context.state.user;
}

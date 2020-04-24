import { Cookies } from 'quasar'
import axios from 'axios'
import * as getters from './getters'

import { LocalStorage } from 'quasar'

export async function retrieveUser(context) {
    var res = await axios.get('/user');
    if (!res.data.user) {
      Cookies.remove('jwt_token');
      context.commit('setUser', null);
    } else {
      context.commit('setUser', res.data.user);
      context.commit('login');
      context.commit('setServices', res.data.services);
      return res.data
    }
}

export async function retrieveServices(context) {
    const services = await axios.get('/user');
    context.commit('setServices', services.data.services);
    return services.data.services
}

export async function logoutUser(context) {
    Cookies.remove('jwt_token');
    context.commit('logout')
    context.commit('setServices', null)
    context.commit('setUser', null);
}

export async function loadUser(context) {
  return context.state.user;
}

export async function isLoggedIn(context) {
  return context.state.loggedIn;
}

import { LocalStorage } from 'quasar'

export function setUser (state, user) {
    state.user = user;
}
export function setServices (state, services) {
    state.services = services;
    LocalStorage.set('services', services);
}

export function logout (state) {
  state.loggedIn = false;
}

export function login (state) {
  state.loggedIn = true;
}

export function deleteService (state, service) {
  let services = state.services;
  let rebuilt = []
  for (let s of services) {
    if (s != service) rebuilt.push(s);
  }
  state.services = rebuilt;
}

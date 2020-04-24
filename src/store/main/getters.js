/*
export function someGetter (state) {
}
*//*
export function isLoggedIn (store) {
  const user = store.state.user;
  if (user) return true;
  else return false;
}
export function getUserId (store) {
  const user = store.state.user;
  if (user) return user.id
}*/

export function getServices(store) {
  const services = store.state.main.services;
  if (!services) return [];
  else return services;
};


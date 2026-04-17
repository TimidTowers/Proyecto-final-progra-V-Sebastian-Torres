export const environment = {
  production: false,
  // Default: navegador web en la misma máquina que el backend.
  // Cambia según tu caso:
  //   Navegador web:        http://localhost:5229/api
  //   Emulador Android:     http://10.0.2.2:5229/api
  //   Celular físico (LAN): http://<IP-LOCAL-DEL-BACKEND>:5229/api
  // Para detectar la IP local del backend en Windows: ipconfig | findstr IPv4
  apiUrl: 'http://localhost:5229/api'
};

# octo-test-node-express

Esta aplicación toma los datos de un API de [Iatistandard API Gateway](https://developer.iatistandard.org/apis) que extrae la ayuda humanitaria que Sudán ha recibido en los últimos años, separándola por año y mostrando la sumatoria general por organización de sus aportaciones.

## Requerimientos
```
postgres 14
node 16
```

Para poner en marcha el proyecto primero clonar el repositorio, una vez clonado:

```
cd pulpo-assignment-test
```

## Variables de entorno

Dentro del proyecto poner especial atención al `.env` y el `.env.example`, seguir los siguientes pasos:

- Primero que nada es necesario hacer una copia del .env.example, y renombrarlo como .env solamente.
ahí se encuentran unas variables de entorno en específico para poner en marcha todo:

Estas dos variables son para incluir los api keys que se obtienen de la siguiente dirección:

[Iatistandard API Gateway](https://developer.iatistandard.org/apis)

En caso de contar ya con una cuenta para acceso a la API, solamente tomar los valores de las dos `API KEYS`, es recomendable utilizar ambos.

Por el contrario si no se cuenta con credenciales para las `API KEYS`, es necesario hacer una cuenta nueva y solicitarla.

- Una vez obtenidas las `API KEYS`, colocarlas en estas variables de entorno:

```
API_KEY_FIRST=
API_KEY_SECOND=
```

- Posteriormente, también es necesario ya sea modificar las siguientes o bien conservar los datos por default, solo que considero que es importande mencionarlo.

```
USER_NAME=
USER_PASSWORD=
```

- El siguiente bloque de variables que son importantes son las de la base de datos, se utilizó postgresql 14 para este pequeño desarrollo.

```
DEV_DB_HOST=localhost
DEV_DB_PORT=5432
DEV_DB_USER=postgres
DEV_DB_PASS=root
DEV_DB_DATABASE=test_pulpo
```

De nuevo, auto explicativo, el nombre del host, del puerto, el usuario en postgres, el password y el nombre de la db.

- El último bloque de variables es para considerar un despliegue a un ambiente de producción,
y no estan consideradas en este proyecto.

```
PROD_DB_USER=
PROD_DB_PASS=
PROD_DB_DATABASE=
```

## Poniendo en marcha el proyecto

Una vez colocado las respectivas variables en el `.env`, ejecutar el siguiente comando, este comando descarga todas las dependencias necesarias, asímismo corre las migraciones para la base de datos e inserta el `user` y el `password` escritos en el `.env`.

```
npm run initialize
```
Y para poner a correr el servidor en el modo `develop`:
```
npm run dev
```
## Endpoints

Los endpoints expuestos son los siguientes:

[Documentación de los endpoints de postman]( https://documenter.getpostman.com/view/4612589/2s8YzRz3MR)


Documentación general de los endpoints.
```
{{URL}}/
```
Para accesar a un endpoint de prueba.
```
{{URL}}/api/
```
Genera un token para autenticar/autorizar el uso de los siguientes endpoints.
```
{{URL}}/api/login
```
Descarga los datos de la `API` a la `db` y muestra el resultado.
Este endpoint necesita el header de Authorization con `Bearer ` y el token generado en el endpoint de `login`.
```
{{URL}}/api/get-data
```
Consulta la `db` por los datos requeridos soportando parámetros. 
Este endpoint necesita el header de Authorization con `Bearer ` y el token generado en el endpoint de `login`.
El endpoint base es el siguiente: 
```
{{URL}}/api/play
```
Soporta los siguientes parámetros:
```
to={{YEAR}}
from={{YEAR}}
sort={{ASC | DESC}}
```
Un ejemplo válido para consultar las transacciones del año 2011 al 2022 en orden descendente, sería:
```
{{URL}}/api/play?from=2011&to2022&sort=DESC
```

## Comandos generales
Hay diversos comandos en el `package.json`:
- Inicia el servidor
```
npm run start
```
- Inicia el servidor en modo `development`.
```
npm run dev
```
- Inicia el línter y muestra el resultado del análisis.
```
npm run lint
```
- Inicia el línter, corrige y en caso de ser posible lo arregla.
```
npm run lint-fix
```
- Corre las migraciones de la `db`.
```
npm run migrate
```
- Da rollback a las migraciones.
```
npm run migrate:undo
```
- Descarga dependencias, corre migraciones y guarda seeds en db, se debe correr `UNA` sola vez este comando.
```
npm run initialize
```
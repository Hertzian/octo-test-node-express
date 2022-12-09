Para poner en marcha el proyecto primero clonar el repositorio, una vez clonado:

```
cd pulpo-assignment-test
```

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

Los endpoints expuestos son los siguientes:


Para accesar a un endpoint de prueva.
```
{{URL}}/
```
Genera un token para autenticar/autorizar el uso de los siguientes endpoints.
```
{{URL}}/login
```
Descarga los datos de la `API` a la `db` y muestra el resultado.
```
{{URL}}/get-data
```
Consulta la `db` por los datos requeridos, cabe mencionar que este endpoint admite los parámetros de `to`, `from` y `sort` de la siguiente manera:
```
to={{YEAR}}
from={{YEAR}}
sort={{ASC | DESC}}
{{URL}}/play
```
Un ejemplo válido para consultar las transacciones del año 2011 al 2022 en orden descendente, sería:
```
{{URL}}/play?from=2011&to2022&sort=DESC
```
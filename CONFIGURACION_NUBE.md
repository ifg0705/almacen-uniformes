# Configuración para sincronización en la nube

Esta versión ya está preparada para guardar inventario, entradas y entregas en una base de datos PostgreSQL compartida.

## Opción gratis recomendada: Neon + Vercel

1. Entra a tu proyecto en Vercel.
2. Abre **Storage** o **Marketplace** y agrega **Neon Postgres**.
3. Elige el plan gratuito y conecta la base de datos al mismo proyecto.
4. Confirma que Vercel haya creado una variable de entorno llamada `DATABASE_URL`.
5. Haz un **Redeploy** del proyecto.

Durante el despliegue, `npm run build` aplicará automáticamente la migración
`migrations/0001_inventory.sql`.

En el primer acceso, el sistema copiará el inventario inicial del catálogo a la
base de datos.

## Cómo saber si ya quedó bien

En la parte superior de la web aparecerá:

- **Nube sincronizada**: los datos se guardan y comparten entre celulares y laptops.
- **Base temporal**: todavía falta configurar `DATABASE_URL`.
- **Error de sincronización**: revisa la conexión de la base de datos o los logs de Vercel.

La aplicación actualiza la información automáticamente cada 10 segundos y también
al volver a enfocar la pestaña.

## Funciones agregadas

- Pestaña **Entradas** para registrar mercancía recibida y sumar existencias.
- Historial de entradas y entregas.
- Kits para:
  - Operador
  - Supervisor
  - Personal de mantenimiento
  - Operador de caseta
- Los cuatro puestos usan el kit:
  - 2 × Pantalón mezclilla
  - 1 × Botas de seguridad
  - 1 × Polo azul cielo
  - 1 × Camisa mezclilla
- Descuento automático de existencias al registrar una entrega.

## Importante

Si publicas la aplicación sin `DATABASE_URL`, la base PGLite incluida sirve para
pruebas, pero en Vercel no debe considerarse almacenamiento permanente.

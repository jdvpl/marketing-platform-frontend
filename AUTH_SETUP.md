# Sistema de Autenticación con Cookies Seguras

## Descripción General

El frontend de Marketing Platform utiliza un sistema de autenticación basado en **cookies httpOnly** para mayor seguridad. Los tokens de acceso y refresh se almacenan en cookies del lado del servidor, evitando vulnerabilidades de XSS.

## Arquitectura

### 1. API Routes (Server-Side)

Los tokens se manejan exclusivamente en el servidor mediante Next.js API Routes:

- **`/api/auth/login`** - Autenticación de usuarios
- **`/api/auth/register`** - Registro de nuevos usuarios
- **`/api/auth/logout`** - Cierre de sesión
- **`/api/auth/me`** - Verificación de sesión actual y refresh automático de tokens

### 2. Middleware de Next.js

**Archivo**: `src/middleware.ts`

El middleware protege automáticamente las rutas:

#### Rutas Protegidas (requieren autenticación):
- `/dashboard`
- `/campaigns`
- `/social`
- `/analytics`
- `/content`
- `/payments`
- `/settings`
- `/profile`

#### Rutas de Autenticación (solo para usuarios NO autenticados):
- `/login`
- `/register`

**Comportamiento**:
- Si un usuario NO autenticado intenta acceder a una ruta protegida → redirige a `/login`
- Si un usuario autenticado intenta acceder a `/login` o `/register` → redirige a `/dashboard`

### 3. Redux Store (authSlice)

**Archivo**: `src/features/auth/authSlice.ts`

#### State:
```typescript
interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}
```

#### Actions:
- `login({ email, password })` - Inicia sesión y guarda cookies httpOnly
- `register({ email, password })` - Registra usuario y guarda cookies httpOnly
- `logout()` - Cierra sesión y elimina cookies
- `checkAuth()` - Verifica estado de autenticación actual

**NOTA**: Los tokens NO se almacenan en el estado de Redux. Solo se almacenan en cookies httpOnly del servidor.

### 4. Hook Personalizado `useAuth`

**Archivo**: `src/hooks/useAuth.ts`

```typescript
const { user, isAuthenticated, isLoading, logout } = useAuth();
```

Proporciona:
- `user` - Datos del usuario actual
- `isAuthenticated` - Estado de autenticación
- `isLoading` - Indica si se está verificando la autenticación
- `logout()` - Función para cerrar sesión

### 5. Componente `ProtectedRoute`

**Archivo**: `src/components/ProtectedRoute.tsx`

Envuelve páginas que requieren autenticación:

```tsx
export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        {/* Contenido protegido */}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
```

## Flujo de Autenticación

### Login
1. Usuario ingresa credenciales en `/login`
2. Se envía POST a `/api/auth/login`
3. API route valida con el backend (puerto 5000)
4. Si es válido, guarda `accessToken` y `refreshToken` en cookies httpOnly
5. Redux store actualiza el usuario
6. Usuario es redirigido a `/dashboard`

### Verificación de Sesión
1. Al cargar una página protegida, el hook `useAuth` ejecuta `checkAuth()`
2. Se hace GET a `/api/auth/me`
3. API route lee el `accessToken` de las cookies
4. Valida con el backend
5. Si el token expiró, intenta refreshear automáticamente con `refreshToken`
6. Retorna datos del usuario

### Logout
1. Usuario hace clic en "Cerrar Sesión"
2. Se envía POST a `/api/auth/logout`
3. API route elimina las cookies `accessToken` y `refreshToken`
4. Redux store limpia el estado de autenticación
5. Usuario es redirigido a `/login`

## Seguridad

### Configuración de Cookies

```typescript
{
  httpOnly: true,              // No accesible desde JavaScript del cliente
  secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
  sameSite: 'lax',            // Protección CSRF
  maxAge: 60 * 60 * 24,       // accessToken: 24 horas
  path: '/',
}
```

### Ventajas de este Enfoque

1. **Protección contra XSS**: Las cookies httpOnly no pueden ser leídas por JavaScript malicioso
2. **Refresh Automático**: Los tokens se refrescan automáticamente en segundo plano
3. **Protección de Rutas**: El middleware verifica autenticación antes de cargar páginas
4. **Sin localStorage**: Evita vulnerabilidades de almacenamiento del cliente

## Uso en Componentes

### Verificar Autenticación
```tsx
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <Loading />;
  if (!isAuthenticated) return <LoginPrompt />;

  return <div>Hola {user.email}</div>;
}
```

### Cerrar Sesión
```tsx
import { useAuth } from '@/hooks/useAuth';

function LogoutButton() {
  const { logout } = useAuth();

  return (
    <button onClick={logout}>
      Cerrar Sesión
    </button>
  );
}
```

### Login Manual
```tsx
import { useAppDispatch } from '@/lib/redux/hooks';
import { login } from '@/features/auth/authSlice';

function LoginForm() {
  const dispatch = useAppDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(login({ email, password })).unwrap();
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
}
```

## Variables de Entorno

Asegúrate de configurar:

```env
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:5000
NODE_ENV=production # para cookies seguras (HTTPS only)
```

## Troubleshooting

### Problema: Cookies no se guardan
- Verifica que el dominio sea el mismo entre frontend y backend
- En desarrollo, ambos deben estar en `localhost`
- Verifica que no haya errores CORS

### Problema: Redirección infinita
- Verifica que las rutas en `middleware.ts` estén correctamente configuradas
- Asegúrate de que el endpoint `/api/auth/me` funcione correctamente

### Problema: Usuario se desloguea constantemente
- Verifica que el `accessToken` no haya expirado
- Verifica que el `refreshToken` funcione correctamente
- Revisa los logs del servidor para errores de validación

## Próximos Pasos

- [ ] Implementar 2FA (Autenticación de dos factores)
- [ ] Agregar remember me (cookies de larga duración)
- [ ] Implementar rate limiting en login
- [ ] Agregar logs de auditoría de sesiones

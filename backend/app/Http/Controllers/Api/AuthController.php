<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\Usuario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $usuario = Usuario::with('rol')
            ->where('correo', $request->correo)
            ->first();

        if (!$usuario || !Hash::check($request->password, $usuario->password_hash)) {
            return response()->json([
                'success' => false,
                'message' => 'Credenciales incorrectas.',
            ], 401);
        }

        if (!$usuario->estado) {
            return response()->json([
                'success' => false,
                'message' => 'El usuario se encuentra inactivo.',
            ], 403);
        }

        $usuario->tokens()->delete();

        $token = $usuario->createToken('token_cup_ficct')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Inicio de sesión exitoso.',
            'token_type' => 'Bearer',
            'access_token' => $token,
            'usuario' => [
                'id' => $usuario->id,
                'nombre' => $usuario->nombre,
                'apellido' => $usuario->apellido,
                'ci' => $usuario->ci,
                'correo' => $usuario->correo,
                'telefono' => $usuario->telefono,
                'estado' => $usuario->estado,
                'rol' => $usuario->rol ? [
                    'id' => $usuario->rol->id,
                    'nombre' => $usuario->rol->nombre,
                    'descripcion' => $usuario->rol->descripcion,
                ] : null,
            ],
        ], 200);
    }

    public function perfil(Request $request): JsonResponse
    {
        $usuario = $request->user()->load('rol');

        return response()->json([
            'success' => true,
            'usuario' => [
                'id' => $usuario->id,
                'nombre' => $usuario->nombre,
                'apellido' => $usuario->apellido,
                'ci' => $usuario->ci,
                'correo' => $usuario->correo,
                'telefono' => $usuario->telefono,
                'estado' => $usuario->estado,
                'rol' => $usuario->rol ? [
                    'id' => $usuario->rol->id,
                    'nombre' => $usuario->rol->nombre,
                    'descripcion' => $usuario->rol->descripcion,
                ] : null,
            ],
        ], 200);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sesión cerrada correctamente.',
        ], 200);
    }

    public function logoutAll(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Todas las sesiones fueron cerradas correctamente.',
        ], 200);
    }
}
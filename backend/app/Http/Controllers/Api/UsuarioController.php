<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UsuarioController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Usuario::with('rol')->orderBy('id', 'desc');

        if ($request->filled('buscar')) {
            $buscar = $request->buscar;

            $query->where(function ($q) use ($buscar) {
                $q->where('nombre', 'ILIKE', "%{$buscar}%")
                    ->orWhere('apellido', 'ILIKE', "%{$buscar}%")
                    ->orWhere('ci', 'ILIKE', "%{$buscar}%")
                    ->orWhere('correo', 'ILIKE', "%{$buscar}%");
            });
        }

        if ($request->filled('estado')) {
            $query->where('estado', filter_var($request->estado, FILTER_VALIDATE_BOOLEAN));
        }

        $usuarios = $query->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $usuarios,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'id_rol' => ['required', 'exists:rol,id'],
            'nombre' => ['required', 'string', 'max:100'],
            'apellido' => ['required', 'string', 'max:100'],
            'ci' => ['required', 'string', 'max:20', 'unique:usuario,ci'],
            'ci_extension' => ['nullable', 'string', 'max:10'],
            'ci_expedido' => ['nullable', 'string', 'max:30'],
            'fecha_nacimiento' => ['nullable', 'date'],
            'sexo' => ['nullable', Rule::in(['MASCULINO', 'FEMENINO', 'OTRO'])],
            'direccion' => ['nullable', 'string', 'max:255'],
            'telefono' => ['nullable', 'string', 'max:30'],
            'correo' => ['required', 'email', 'max:150', 'unique:usuario,correo'],
            'password' => ['required', 'string', 'min:6'],
        ], [
            'id_rol.required' => 'El rol es obligatorio.',
            'id_rol.exists' => 'El rol seleccionado no existe.',
            'nombre.required' => 'El nombre es obligatorio.',
            'apellido.required' => 'El apellido es obligatorio.',
            'ci.required' => 'El CI es obligatorio.',
            'ci.unique' => 'El CI ya está registrado.',
            'correo.required' => 'El correo es obligatorio.',
            'correo.email' => 'El correo no tiene un formato válido.',
            'correo.unique' => 'El correo ya está registrado.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.min' => 'La contraseña debe tener al menos 6 caracteres.',
        ]);

        $datos['password_hash'] = Hash::make($datos['password']);
        unset($datos['password']);

        $datos['estado'] = true;

        $usuario = Usuario::create($datos);
        $usuario->load('rol');

        return response()->json([
            'success' => true,
            'message' => 'Usuario registrado correctamente.',
            'data' => $usuario,
        ], 201);
    }

    public function show(Usuario $usuario): JsonResponse
    {
        $usuario->load('rol');

        return response()->json([
            'success' => true,
            'data' => $usuario,
        ]);
    }

    public function update(Request $request, Usuario $usuario): JsonResponse
    {
        $datos = $request->validate([
            'id_rol' => ['required', 'exists:rol,id'],
            'nombre' => ['required', 'string', 'max:100'],
            'apellido' => ['required', 'string', 'max:100'],
            'ci' => [
                'required',
                'string',
                'max:20',
                Rule::unique('usuario', 'ci')->ignore($usuario->id),
            ],
            'ci_extension' => ['nullable', 'string', 'max:10'],
            'ci_expedido' => ['nullable', 'string', 'max:30'],
            'fecha_nacimiento' => ['nullable', 'date'],
            'sexo' => ['nullable', Rule::in(['MASCULINO', 'FEMENINO', 'OTRO'])],
            'direccion' => ['nullable', 'string', 'max:255'],
            'telefono' => ['nullable', 'string', 'max:30'],
            'correo' => [
                'required',
                'email',
                'max:150',
                Rule::unique('usuario', 'correo')->ignore($usuario->id),
            ],
            'password' => ['nullable', 'string', 'min:6'],
            'estado' => ['nullable', 'boolean'],
        ], [
            'id_rol.required' => 'El rol es obligatorio.',
            'id_rol.exists' => 'El rol seleccionado no existe.',
            'ci.unique' => 'El CI ya está registrado.',
            'correo.unique' => 'El correo ya está registrado.',
            'password.min' => 'La contraseña debe tener al menos 6 caracteres.',
        ]);

        if (!empty($datos['password'])) {
            $datos['password_hash'] = Hash::make($datos['password']);
        }

        unset($datos['password']);

        $usuario->update($datos);
        $usuario->load('rol');

        return response()->json([
            'success' => true,
            'message' => 'Usuario actualizado correctamente.',
            'data' => $usuario,
        ]);
    }

    public function destroy(Usuario $usuario): JsonResponse
    {
        $usuario->update([
            'estado' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Usuario desactivado correctamente.',
        ]);
    }

    public function activar(Usuario $usuario): JsonResponse
    {
        $usuario->update([
            'estado' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Usuario activado correctamente.',
        ]);
    }
}
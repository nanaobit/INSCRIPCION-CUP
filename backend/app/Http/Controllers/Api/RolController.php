<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rol;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RolController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Rol::with('permisos')->orderBy('id', 'asc');

        if ($request->filled('buscar')) {
            $buscar = $request->buscar;

            $query->where(function ($q) use ($buscar) {
                $q->where('nombre', 'ILIKE', "%{$buscar}%")
                    ->orWhere('descripcion', 'ILIKE', "%{$buscar}%");
            });
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'nombre' => ['required', 'string', 'max:50', 'unique:rol,nombre'],
            'descripcion' => ['nullable', 'string'],
        ], [
            'nombre.required' => 'El nombre del rol es obligatorio.',
            'nombre.unique' => 'Ya existe un rol con ese nombre.',
        ]);

        $rol = Rol::create($datos);

        return response()->json([
            'success' => true,
            'message' => 'Rol registrado correctamente.',
            'data' => $rol,
        ], 201);
    }

    public function show(Rol $rol): JsonResponse
    {
        $rol->load('permisos');

        return response()->json([
            'success' => true,
            'data' => $rol,
        ]);
    }

    public function update(Request $request, Rol $rol): JsonResponse
    {
        $datos = $request->validate([
            'nombre' => [
                'required',
                'string',
                'max:50',
                Rule::unique('rol', 'nombre')->ignore($rol->id),
            ],
            'descripcion' => ['nullable', 'string'],
        ], [
            'nombre.required' => 'El nombre del rol es obligatorio.',
            'nombre.unique' => 'Ya existe un rol con ese nombre.',
        ]);

        $rol->update($datos);

        return response()->json([
            'success' => true,
            'message' => 'Rol actualizado correctamente.',
            'data' => $rol,
        ]);
    }

    public function destroy(Rol $rol): JsonResponse
    {
        if ($rol->usuarios()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar el rol porque tiene usuarios asignados.',
            ], 409);
        }

        $rol->permisos()->detach();
        $rol->delete();

        return response()->json([
            'success' => true,
            'message' => 'Rol eliminado correctamente.',
        ]);
    }

    public function permisos(Rol $rol): JsonResponse
    {
        $rol->load('permisos');

        return response()->json([
            'success' => true,
            'data' => [
                'rol' => $rol->nombre,
                'permisos' => $rol->permisos,
            ],
        ]);
    }

    public function asignarPermisos(Request $request, Rol $rol): JsonResponse
    {
        $datos = $request->validate([
            'permisos' => ['required', 'array'],
            'permisos.*' => ['integer', 'exists:permiso,id'],
        ], [
            'permisos.required' => 'Debe enviar una lista de permisos.',
            'permisos.array' => 'Los permisos deben enviarse como arreglo.',
            'permisos.*.exists' => 'Uno o más permisos no existen.',
        ]);

        $rol->permisos()->sync($datos['permisos']);
        $rol->load('permisos');

        return response()->json([
            'success' => true,
            'message' => 'Permisos asignados correctamente al rol.',
            'data' => $rol,
        ]);
    }
}
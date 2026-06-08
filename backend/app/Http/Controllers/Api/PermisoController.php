<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Permiso;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PermisoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Permiso::orderBy('modulo', 'asc')
            ->orderBy('nombre', 'asc');

        if ($request->filled('buscar')) {
            $buscar = $request->buscar;

            $query->where(function ($q) use ($buscar) {
                $q->where('nombre', 'ILIKE', "%{$buscar}%")
                    ->orWhere('descripcion', 'ILIKE', "%{$buscar}%")
                    ->orWhere('modulo', 'ILIKE', "%{$buscar}%");
            });
        }

        if ($request->filled('modulo')) {
            $query->where('modulo', $request->modulo);
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'nombre' => ['required', 'string', 'max:100', 'unique:permiso,nombre'],
            'descripcion' => ['nullable', 'string'],
            'modulo' => ['required', 'string', 'max:100'],
        ], [
            'nombre.required' => 'El nombre del permiso es obligatorio.',
            'nombre.unique' => 'Ya existe un permiso con ese nombre.',
            'modulo.required' => 'El módulo es obligatorio.',
        ]);

        $permiso = Permiso::create($datos);

        return response()->json([
            'success' => true,
            'message' => 'Permiso registrado correctamente.',
            'data' => $permiso,
        ], 201);
    }

    public function show(Permiso $permiso): JsonResponse
    {
        $permiso->load('roles');

        return response()->json([
            'success' => true,
            'data' => $permiso,
        ]);
    }

    public function update(Request $request, Permiso $permiso): JsonResponse
    {
        $datos = $request->validate([
            'nombre' => [
                'required',
                'string',
                'max:100',
                Rule::unique('permiso', 'nombre')->ignore($permiso->id),
            ],
            'descripcion' => ['nullable', 'string'],
            'modulo' => ['required', 'string', 'max:100'],
        ], [
            'nombre.required' => 'El nombre del permiso es obligatorio.',
            'nombre.unique' => 'Ya existe un permiso con ese nombre.',
            'modulo.required' => 'El módulo es obligatorio.',
        ]);

        $permiso->update($datos);

        return response()->json([
            'success' => true,
            'message' => 'Permiso actualizado correctamente.',
            'data' => $permiso,
        ]);
    }

    public function destroy(Permiso $permiso): JsonResponse
    {
        if ($permiso->roles()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar el permiso porque está asignado a uno o más roles.',
            ], 409);
        }

        $permiso->delete();

        return response()->json([
            'success' => true,
            'message' => 'Permiso eliminado correctamente.',
        ]);
    }
}
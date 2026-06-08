<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Carrera;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CarreraController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Carrera::orderBy('nombre', 'asc');

        if ($request->filled('buscar')) {
            $buscar = $request->buscar;

            $query->where(function ($q) use ($buscar) {
                $q->where('nombre', 'ILIKE', "%{$buscar}%")
                    ->orWhere('descripcion', 'ILIKE', "%{$buscar}%");
            });
        }

        if ($request->filled('estado')) {
            $query->where('estado', filter_var($request->estado, FILTER_VALIDATE_BOOLEAN));
        }

        return response()->json([
            'success' => true,
            'data' => $query->paginate(10),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'nombre' => ['required', 'string', 'max:150', 'unique:carrera,nombre'],
            'descripcion' => ['nullable', 'string'],
            'estado' => ['nullable', 'boolean'],
        ], [
            'nombre.required' => 'El nombre de la carrera es obligatorio.',
            'nombre.unique' => 'Ya existe una carrera con ese nombre.',
        ]);

        $datos['estado'] = $datos['estado'] ?? true;

        $carrera = Carrera::create($datos);

        return response()->json([
            'success' => true,
            'message' => 'Carrera registrada correctamente.',
            'data' => $carrera,
        ], 201);
    }

    public function show(Carrera $carrera): JsonResponse
    {
        $carrera->load('cuposCarrera.gestionAcademica');

        return response()->json([
            'success' => true,
            'data' => $carrera,
        ]);
    }

    public function update(Request $request, Carrera $carrera): JsonResponse
    {
        $datos = $request->validate([
            'nombre' => [
                'required',
                'string',
                'max:150',
                Rule::unique('carrera', 'nombre')->ignore($carrera->id),
            ],
            'descripcion' => ['nullable', 'string'],
            'estado' => ['required', 'boolean'],
        ], [
            'nombre.required' => 'El nombre de la carrera es obligatorio.',
            'nombre.unique' => 'Ya existe una carrera con ese nombre.',
        ]);

        $carrera->update($datos);

        return response()->json([
            'success' => true,
            'message' => 'Carrera actualizada correctamente.',
            'data' => $carrera,
        ]);
    }

    public function destroy(Carrera $carrera): JsonResponse
    {
        if ($carrera->postulaciones()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar la carrera porque tiene postulantes asociados.',
            ], 409);
        }

        $carrera->update([
            'estado' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Carrera desactivada correctamente.',
        ]);
    }

    public function activar(Carrera $carrera): JsonResponse
    {
        $carrera->update([
            'estado' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Carrera activada correctamente.',
        ]);
    }
}
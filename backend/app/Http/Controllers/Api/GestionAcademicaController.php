<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GestionAcademica;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class GestionAcademicaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = GestionAcademica::orderBy('gestion', 'desc')
            ->orderBy('id', 'desc');

        if ($request->filled('buscar')) {
            $buscar = $request->buscar;

            $query->where(function ($q) use ($buscar) {
                $q->where('nombre', 'ILIKE', "%{$buscar}%")
                    ->orWhere('periodo', 'ILIKE', "%{$buscar}%");
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
            'nombre' => ['required', 'string', 'max:100'],
            'gestion' => ['required', 'integer', 'min:2000', 'max:2100'],
            'periodo' => [
                'required',
                'string',
                'max:50',
                Rule::unique('gestion_academica', 'periodo')
                    ->where(fn ($q) => $q->where('gestion', $request->gestion)),
            ],
            'fecha_inicio' => ['required', 'date'],
            'fecha_fin' => ['required', 'date', 'after_or_equal:fecha_inicio'],
            'estado' => ['nullable', 'boolean'],
        ], [
            'nombre.required' => 'El nombre de la gestión académica es obligatorio.',
            'gestion.required' => 'La gestión es obligatoria.',
            'periodo.required' => 'El periodo es obligatorio.',
            'periodo.unique' => 'Ya existe una gestión académica con ese periodo.',
            'fecha_inicio.required' => 'La fecha de inicio es obligatoria.',
            'fecha_fin.required' => 'La fecha de fin es obligatoria.',
            'fecha_fin.after_or_equal' => 'La fecha de fin debe ser mayor o igual a la fecha de inicio.',
        ]);

        $datos['estado'] = $datos['estado'] ?? true;

        $gestion = GestionAcademica::create($datos);

        return response()->json([
            'success' => true,
            'message' => 'Gestión académica registrada correctamente.',
            'data' => $gestion,
        ], 201);
    }

    public function show(GestionAcademica $gestion): JsonResponse
    {
        $gestion->load('cuposCarrera.carrera');

        return response()->json([
            'success' => true,
            'data' => $gestion,
        ]);
    }

    public function update(Request $request, GestionAcademica $gestion): JsonResponse
    {
        $datos = $request->validate([
            'nombre' => ['required', 'string', 'max:100'],
            'gestion' => ['required', 'integer', 'min:2000', 'max:2100'],
            'periodo' => [
                'required',
                'string',
                'max:50',
                Rule::unique('gestion_academica', 'periodo')
                    ->where(fn ($q) => $q->where('gestion', $request->gestion))
                    ->ignore($gestion->id),
            ],
            'fecha_inicio' => ['required', 'date'],
            'fecha_fin' => ['required', 'date', 'after_or_equal:fecha_inicio'],
            'estado' => ['required', 'boolean'],
        ], [
            'periodo.unique' => 'Ya existe una gestión académica con ese periodo.',
            'fecha_fin.after_or_equal' => 'La fecha de fin debe ser mayor o igual a la fecha de inicio.',
        ]);

        $gestion->update($datos);

        return response()->json([
            'success' => true,
            'message' => 'Gestión académica actualizada correctamente.',
            'data' => $gestion,
        ]);
    }

    public function destroy(GestionAcademica $gestion): JsonResponse
    {
        if ($gestion->postulantes()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar la gestión porque tiene postulantes registrados.',
            ], 409);
        }

        $gestion->update([
            'estado' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Gestión académica desactivada correctamente.',
        ]);
    }

    public function activar(GestionAcademica $gestion): JsonResponse
    {
        $gestion->update([
            'estado' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Gestión académica activada correctamente.',
        ]);
    }
}
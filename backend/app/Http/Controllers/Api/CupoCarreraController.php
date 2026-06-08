<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CupoCarrera;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CupoCarreraController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = CupoCarrera::with([
            'gestionAcademica',
            'carrera',
        ])->orderBy('id', 'desc');

        if ($request->filled('id_gestion_academica')) {
            $query->where('id_gestion_academica', $request->id_gestion_academica);
        }

        if ($request->filled('id_carrera')) {
            $query->where('id_carrera', $request->id_carrera);
        }

        if ($request->filled('estado')) {
            $query->where('estado', filter_var($request->estado, FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('buscar')) {
            $buscar = $request->buscar;

            $query->whereHas('carrera', function ($q) use ($buscar) {
                $q->where('nombre', 'ILIKE', "%{$buscar}%");
            });
        }

        return response()->json([
            'success' => true,
            'data' => $query->paginate(10),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'id_gestion_academica' => ['required', 'exists:gestion_academica,id'],
            'id_carrera' => [
                'required',
                'exists:carrera,id',
                Rule::unique('cupo_carrera', 'id_carrera')
                    ->where(fn ($q) => $q->where('id_gestion_academica', $request->id_gestion_academica)),
            ],
            'cantidad_cupos' => ['required', 'integer', 'min:0'],
            'cupos_disponibles' => ['nullable', 'integer', 'min:0'],
            'estado' => ['nullable', 'boolean'],
        ], [
            'id_gestion_academica.required' => 'La gestión académica es obligatoria.',
            'id_gestion_academica.exists' => 'La gestión académica seleccionada no existe.',
            'id_carrera.required' => 'La carrera es obligatoria.',
            'id_carrera.exists' => 'La carrera seleccionada no existe.',
            'id_carrera.unique' => 'Ya existe un cupo registrado para esta carrera en la gestión seleccionada.',
            'cantidad_cupos.required' => 'La cantidad de cupos es obligatoria.',
            'cantidad_cupos.min' => 'La cantidad de cupos no puede ser negativa.',
        ]);

        $datos['cupos_disponibles'] = $datos['cupos_disponibles'] ?? $datos['cantidad_cupos'];
        $datos['estado'] = $datos['estado'] ?? true;

        if ($datos['cupos_disponibles'] > $datos['cantidad_cupos']) {
            return response()->json([
                'success' => false,
                'message' => 'Los cupos disponibles no pueden ser mayores a la cantidad total de cupos.',
            ], 422);
        }

        $cupo = CupoCarrera::create($datos);
        $cupo->load(['gestionAcademica', 'carrera']);

        return response()->json([
            'success' => true,
            'message' => 'Cupo de carrera registrado correctamente.',
            'data' => $cupo,
        ], 201);
    }

    public function show(CupoCarrera $cupo): JsonResponse
    {
        $cupo->load(['gestionAcademica', 'carrera']);

        return response()->json([
            'success' => true,
            'data' => $cupo,
        ]);
    }

    public function update(Request $request, CupoCarrera $cupo): JsonResponse
    {
        $datos = $request->validate([
            'id_gestion_academica' => ['required', 'exists:gestion_academica,id'],
            'id_carrera' => [
                'required',
                'exists:carrera,id',
                Rule::unique('cupo_carrera', 'id_carrera')
                    ->where(fn ($q) => $q->where('id_gestion_academica', $request->id_gestion_academica))
                    ->ignore($cupo->id),
            ],
            'cantidad_cupos' => ['required', 'integer', 'min:0'],
            'cupos_disponibles' => ['required', 'integer', 'min:0'],
            'estado' => ['required', 'boolean'],
        ], [
            'id_carrera.unique' => 'Ya existe un cupo registrado para esta carrera en la gestión seleccionada.',
        ]);

        if ($datos['cupos_disponibles'] > $datos['cantidad_cupos']) {
            return response()->json([
                'success' => false,
                'message' => 'Los cupos disponibles no pueden ser mayores a la cantidad total de cupos.',
            ], 422);
        }

        $cupo->update($datos);
        $cupo->load(['gestionAcademica', 'carrera']);

        return response()->json([
            'success' => true,
            'message' => 'Cupo de carrera actualizado correctamente.',
            'data' => $cupo,
        ]);
    }

    public function destroy(CupoCarrera $cupo): JsonResponse
    {
        $cupo->update([
            'estado' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cupo de carrera desactivado correctamente.',
        ]);
    }

    public function activar(CupoCarrera $cupo): JsonResponse
    {
        $cupo->update([
            'estado' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cupo de carrera activado correctamente.',
        ]);
    }

    public function porGestion(int $idGestion): JsonResponse
    {
        $cupos = CupoCarrera::with(['gestionAcademica', 'carrera'])
            ->where('id_gestion_academica', $idGestion)
            ->where('estado', true)
            ->orderBy('id_carrera', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $cupos,
        ]);
    }

    public function porCarrera(int $idCarrera): JsonResponse
    {
        $cupos = CupoCarrera::with(['gestionAcademica', 'carrera'])
            ->where('id_carrera', $idCarrera)
            ->orderBy('id_gestion_academica', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $cupos,
        ]);
    }
}
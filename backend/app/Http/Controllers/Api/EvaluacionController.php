<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Evaluacion;
use App\Models\Materia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EvaluacionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Evaluacion::with('materia')
            ->orderBy('id_materia', 'asc')
            ->orderBy('nro_evaluacion', 'asc');

        if ($request->filled('id_materia')) {
            $query->where('id_materia', $request->id_materia);
        }

        if ($request->filled('estado')) {
            $query->where('estado', filter_var($request->estado, FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('buscar')) {
            $buscar = $request->buscar;

            $query->where(function ($q) use ($buscar) {
                $q->where('nombre', 'ILIKE', "%{$buscar}%")
                    ->orWhereHas('materia', function ($m) use ($buscar) {
                        $m->where('nombre', 'ILIKE', "%{$buscar}%")
                            ->orWhere('sigla', 'ILIKE', "%{$buscar}%");
                    });
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
            'id_materia' => ['required', 'exists:materia,id'],
            'nro_evaluacion' => [
                'required',
                'integer',
                'between:1,3',
                Rule::unique('evaluacion', 'nro_evaluacion')
                    ->where(fn ($q) => $q->where('id_materia', $request->id_materia)),
            ],
            'nombre' => ['required', 'string', 'max:100'],
            'fecha' => ['nullable', 'date'],
            'porcentaje' => ['required', 'numeric', 'min:0.01', 'max:100'],
            'estado' => ['nullable', 'boolean'],
        ], [
            'id_materia.required' => 'La materia es obligatoria.',
            'id_materia.exists' => 'La materia seleccionada no existe.',
            'nro_evaluacion.required' => 'El número de evaluación es obligatorio.',
            'nro_evaluacion.between' => 'El número de evaluación debe estar entre 1 y 3.',
            'nro_evaluacion.unique' => 'Ya existe esa evaluación para la materia seleccionada.',
            'nombre.required' => 'El nombre de la evaluación es obligatorio.',
            'porcentaje.required' => 'El porcentaje es obligatorio.',
            'porcentaje.min' => 'El porcentaje debe ser mayor a 0.',
            'porcentaje.max' => 'El porcentaje no puede ser mayor a 100.',
        ]);

        $materia = Materia::findOrFail($datos['id_materia']);

        $cantidadEvaluaciones = $materia->evaluaciones()->count();

        if ($cantidadEvaluaciones >= 3) {
            return response()->json([
                'success' => false,
                'message' => 'La materia ya tiene las 3 evaluaciones permitidas.',
            ], 422);
        }

        $sumaPorcentajes = $materia->evaluaciones()
            ->where('estado', true)
            ->sum('porcentaje');

        if (($sumaPorcentajes + $datos['porcentaje']) > 100) {
            return response()->json([
                'success' => false,
                'message' => 'La suma de porcentajes de las evaluaciones no puede superar el 100%.',
                'porcentaje_actual' => $sumaPorcentajes,
                'porcentaje_nuevo' => $datos['porcentaje'],
            ], 422);
        }

        $datos['estado'] = $datos['estado'] ?? true;

        $evaluacion = Evaluacion::create($datos);
        $evaluacion->load('materia');

        return response()->json([
            'success' => true,
            'message' => 'Evaluación registrada correctamente.',
            'data' => $evaluacion,
        ], 201);
    }

    public function show(Evaluacion $evaluacion): JsonResponse
    {
        $evaluacion->load('materia');

        return response()->json([
            'success' => true,
            'data' => $evaluacion,
        ]);
    }

    public function update(Request $request, Evaluacion $evaluacion): JsonResponse
    {
        $datos = $request->validate([
            'id_materia' => ['required', 'exists:materia,id'],
            'nro_evaluacion' => [
                'required',
                'integer',
                'between:1,3',
                Rule::unique('evaluacion', 'nro_evaluacion')
                    ->where(fn ($q) => $q->where('id_materia', $request->id_materia))
                    ->ignore($evaluacion->id),
            ],
            'nombre' => ['required', 'string', 'max:100'],
            'fecha' => ['nullable', 'date'],
            'porcentaje' => ['required', 'numeric', 'min:0.01', 'max:100'],
            'estado' => ['required', 'boolean'],
        ], [
            'id_materia.required' => 'La materia es obligatoria.',
            'id_materia.exists' => 'La materia seleccionada no existe.',
            'nro_evaluacion.required' => 'El número de evaluación es obligatorio.',
            'nro_evaluacion.between' => 'El número de evaluación debe estar entre 1 y 3.',
            'nro_evaluacion.unique' => 'Ya existe esa evaluación para la materia seleccionada.',
            'nombre.required' => 'El nombre de la evaluación es obligatorio.',
            'porcentaje.required' => 'El porcentaje es obligatorio.',
        ]);

        $materia = Materia::findOrFail($datos['id_materia']);

        $sumaPorcentajes = $materia->evaluaciones()
            ->where('estado', true)
            ->where('id', '!=', $evaluacion->id)
            ->sum('porcentaje');

        if ($datos['estado'] && (($sumaPorcentajes + $datos['porcentaje']) > 100)) {
            return response()->json([
                'success' => false,
                'message' => 'La suma de porcentajes de las evaluaciones no puede superar el 100%.',
                'porcentaje_actual_sin_esta_evaluacion' => $sumaPorcentajes,
                'porcentaje_nuevo' => $datos['porcentaje'],
            ], 422);
        }

        $evaluacion->update($datos);
        $evaluacion->load('materia');

        return response()->json([
            'success' => true,
            'message' => 'Evaluación actualizada correctamente.',
            'data' => $evaluacion,
        ]);
    }

    public function destroy(Evaluacion $evaluacion): JsonResponse
    {
        $evaluacion->estado = false;
        $evaluacion->save();

        return response()->json([
            'success' => true,
            'message' => 'Evaluación desactivada correctamente.',
            'data' => $evaluacion->fresh()->load('materia'),
        ]);
    }

    public function activar(Evaluacion $evaluacion): JsonResponse
    {
        $materia = $evaluacion->materia;

        $sumaPorcentajes = $materia->evaluaciones()
            ->where('estado', true)
            ->where('id', '!=', $evaluacion->id)
            ->sum('porcentaje');

        if (($sumaPorcentajes + $evaluacion->porcentaje) > 100) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede activar. La suma de porcentajes superaría el 100%.',
            ], 422);
        }

        $evaluacion->update([
            'estado' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Evaluación activada correctamente.',
            'data' => $evaluacion->fresh()->load('materia'),
        ]);
    }

    public function porMateria(Materia $materia): JsonResponse
    {
        $evaluaciones = $materia->evaluaciones()
            ->orderBy('nro_evaluacion', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'materia' => $materia,
                'evaluaciones' => $evaluaciones,
            ],
        ]);
    }
}
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Materia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MateriaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Materia::withCount('evaluaciones')
            ->orderBy('nombre', 'asc');

        if ($request->filled('buscar')) {
            $buscar = $request->buscar;

            $query->where(function ($q) use ($buscar) {
                $q->where('nombre', 'ILIKE', "%{$buscar}%")
                    ->orWhere('sigla', 'ILIKE', "%{$buscar}%")
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
            'sigla' => ['required', 'string', 'max:20', 'unique:materia,sigla'],
            'nombre' => ['required', 'string', 'max:100', 'unique:materia,nombre'],
            'descripcion' => ['nullable', 'string'],
            'estado' => ['nullable', 'boolean'],
        ], [
            'sigla.required' => 'La sigla de la materia es obligatoria.',
            'sigla.unique' => 'Ya existe una materia con esa sigla.',
            'nombre.required' => 'El nombre de la materia es obligatorio.',
            'nombre.unique' => 'Ya existe una materia con ese nombre.',
        ]);

        $datos['estado'] = $datos['estado'] ?? true;

        $materia = Materia::create($datos);

        return response()->json([
            'success' => true,
            'message' => 'Materia registrada correctamente.',
            'data' => $materia,
        ], 201);
    }

    public function show(Materia $materia): JsonResponse
    {
        $materia->load('evaluaciones');

        return response()->json([
            'success' => true,
            'data' => $materia,
        ]);
    }

    public function update(Request $request, Materia $materia): JsonResponse
    {
        $datos = $request->validate([
            'sigla' => [
                'required',
                'string',
                'max:20',
                Rule::unique('materia', 'sigla')->ignore($materia->id),
            ],
            'nombre' => [
                'required',
                'string',
                'max:100',
                Rule::unique('materia', 'nombre')->ignore($materia->id),
            ],
            'descripcion' => ['nullable', 'string'],
            'estado' => ['required', 'boolean'],
        ], [
            'sigla.required' => 'La sigla de la materia es obligatoria.',
            'sigla.unique' => 'Ya existe una materia con esa sigla.',
            'nombre.required' => 'El nombre de la materia es obligatorio.',
            'nombre.unique' => 'Ya existe una materia con ese nombre.',
        ]);

        $materia->update($datos);

        return response()->json([
            'success' => true,
            'message' => 'Materia actualizada correctamente.',
            'data' => $materia,
        ]);
    }

    public function destroy(Materia $materia): JsonResponse
    {
        if ($materia->evaluaciones()->exists()) {
            $materia->update([
                'estado' => false,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'La materia tiene evaluaciones asociadas, por eso fue desactivada.',
            ]);
        }

        $materia->update([
            'estado' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Materia desactivada correctamente.',
        ]);
    }

    public function activar(Materia $materia): JsonResponse
    {
        $materia->update([
            'estado' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Materia activada correctamente.',
        ]);
    }

    public function evaluaciones(Materia $materia): JsonResponse
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
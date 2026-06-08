<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Postulante;
use App\Models\RequisitoPostulante;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class RequisitoPostulanteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = RequisitoPostulante::with([
            'postulante.usuario',
            'postulante.gestionAcademica',
            'validador',
        ])->orderBy('id', 'desc');

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->filled('buscar')) {
            $buscar = $request->buscar;

            $query->whereHas('postulante.usuario', function ($q) use ($buscar) {
                $q->where('nombre', 'ILIKE', "%{$buscar}%")
                    ->orWhere('apellido', 'ILIKE', "%{$buscar}%")
                    ->orWhere('ci', 'ILIKE', "%{$buscar}%")
                    ->orWhere('correo', 'ILIKE', "%{$buscar}%");
            });
        }

        $requisitos = $query->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $requisitos,
        ]);
    }

    public function pendientes(Request $request): JsonResponse
    {
        $query = RequisitoPostulante::with([
            'postulante.usuario',
            'postulante.gestionAcademica',
        ])
            ->where('estado', 'PENDIENTE')
            ->orderBy('id', 'desc');

        if ($request->filled('buscar')) {
            $buscar = $request->buscar;

            $query->whereHas('postulante.usuario', function ($q) use ($buscar) {
                $q->where('nombre', 'ILIKE', "%{$buscar}%")
                    ->orWhere('apellido', 'ILIKE', "%{$buscar}%")
                    ->orWhere('ci', 'ILIKE', "%{$buscar}%")
                    ->orWhere('correo', 'ILIKE', "%{$buscar}%");
            });
        }

        return response()->json([
            'success' => true,
            'data' => $query->paginate(10),
        ]);
    }

    public function show(RequisitoPostulante $requisito): JsonResponse
    {
        $requisito->load([
            'postulante.usuario',
            'postulante.gestionAcademica',
            'postulante.carrerasPostuladas.carrera',
            'validador',
        ]);

        return response()->json([
            'success' => true,
            'data' => $requisito,
        ]);
    }

    public function actualizarPresentados(Request $request, RequisitoPostulante $requisito): JsonResponse
    {
        $datos = $request->validate([
            'titulo_bachiller' => ['required', 'boolean'],
            'documento_identidad' => ['required', 'boolean'],
            'otros_requisitos' => ['nullable', 'string'],
            'observacion' => ['nullable', 'string'],
        ]);

        $requisito->update([
            'titulo_bachiller' => $datos['titulo_bachiller'],
            'documento_identidad' => $datos['documento_identidad'],
            'otros_requisitos' => $datos['otros_requisitos'] ?? null,
            'observacion' => $datos['observacion'] ?? null,
            'estado' => 'PENDIENTE',
            'id_usuario_validador' => null,
            'fecha_validacion' => null,
        ]);

        $requisito->postulante->update([
            'estado_requisitos' => 'PENDIENTE',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Requisitos presentados actualizados correctamente.',
            'data' => $requisito->fresh()->load('postulante.usuario'),
        ]);
    }

    public function validar(Request $request, RequisitoPostulante $requisito): JsonResponse
    {
        $datos = $request->validate([
            'observacion' => ['nullable', 'string'],
        ]);

        if (!$requisito->titulo_bachiller || !$requisito->documento_identidad) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede validar. El postulante no presentó todos los requisitos obligatorios.',
                'requisitos' => [
                    'titulo_bachiller' => $requisito->titulo_bachiller,
                    'documento_identidad' => $requisito->documento_identidad,
                ],
            ], 422);
        }

        DB::transaction(function () use ($request, $requisito, $datos) {
            $requisito->update([
                'estado' => 'VALIDADO',
                'observacion' => $datos['observacion'] ?? 'Requisitos validados correctamente.',
                'id_usuario_validador' => $request->user()->id,
                'fecha_validacion' => now(),
            ]);

            $requisito->postulante->update([
                'estado_requisitos' => 'VALIDADO',
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Requisitos validados correctamente.',
            'data' => $requisito->fresh()->load([
                'postulante.usuario',
                'validador',
            ]),
        ]);
    }

    public function rechazar(Request $request, RequisitoPostulante $requisito): JsonResponse
    {
        $datos = $request->validate([
            'observacion' => ['required', 'string'],
        ], [
            'observacion.required' => 'Debe indicar el motivo del rechazo.',
        ]);

        DB::transaction(function () use ($request, $requisito, $datos) {
            $requisito->update([
                'estado' => 'RECHAZADO',
                'observacion' => $datos['observacion'],
                'id_usuario_validador' => $request->user()->id,
                'fecha_validacion' => now(),
            ]);

            $requisito->postulante->update([
                'estado_requisitos' => 'RECHAZADO',
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Requisitos rechazados correctamente.',
            'data' => $requisito->fresh()->load([
                'postulante.usuario',
                'validador',
            ]),
        ]);
    }

    public function requisitosPorPostulante(Postulante $postulante): JsonResponse
    {
        $requisito = $postulante->requisito()
            ->with('validador')
            ->first();

        if (!$requisito) {
            return response()->json([
                'success' => false,
                'message' => 'El postulante no tiene requisitos registrados.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $requisito,
        ]);
    }
}
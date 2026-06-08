<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Evaluacion extends Model
{
    protected $table = 'evaluacion';

    protected $fillable = [
        'id_materia',
        'nro_evaluacion',
        'nombre',
        'fecha',
        'porcentaje',
        'estado',
    ];

    protected $casts = [
        'fecha' => 'date',
        'porcentaje' => 'decimal:2',
        'estado' => 'boolean',
    ];

    public function materia()
    {
        return $this->belongsTo(Materia::class, 'id_materia');
    }

    public function notas()
    {
        return $this->hasMany(NotaEvaluacion::class, 'id_evaluacion');
    }
}
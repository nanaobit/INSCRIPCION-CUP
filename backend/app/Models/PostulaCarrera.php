<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PostulaCarrera extends Model
{
    protected $table = 'postula_carrera';

    protected $fillable = [
        'id_postulante',
        'id_carrera',
        'opcion_carrera',
        'fecha_postulacion',
        'estado',
    ];

    protected $casts = [
        'fecha_postulacion' => 'datetime',
    ];

    public $timestamps = false;

    public function postulante()
    {
        return $this->belongsTo(Postulante::class, 'id_postulante');
    }

    public function carrera()
    {
        return $this->belongsTo(Carrera::class, 'id_carrera');
    }
}
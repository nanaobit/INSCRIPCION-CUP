<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Materia extends Model
{
    protected $table = 'materia';

    protected $fillable = [
        'sigla',
        'nombre',
        'descripcion',
        'estado',
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];

    public function evaluaciones()
    {
        return $this->hasMany(Evaluacion::class, 'id_materia');
    }

    public function docenteMaterias()
    {
        return $this->hasMany(DocenteMateria::class, 'id_materia');
    }

    public function asignacionesAcademicas()
    {
        return $this->hasMany(AsignacionAcademica::class, 'id_materia');
    }

    public function resultadosMateria()
    {
        return $this->hasMany(ResultadoMateria::class, 'id_materia');
    }
}
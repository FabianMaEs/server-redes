const express = require('express');
const fsPromises = require('fs/promises');
const cors = require('cors');
const app = express();
const puerto = 3000;

app.use(express.json());
app.use(cors());

app.post('/registro', async (req, res) => {
  try {
    const datosRecibidos = req.body;
    console.log('Datos recibidos:', datosRecibidos);

    const datosAntiguos = await fsPromises.readFile('data1/usuarios.json', 'utf-8');
    const usuarios = JSON.parse(datosAntiguos);

    usuarios.push(datosRecibidos);

    await fsPromises.writeFile('data1/usuarios.json', JSON.stringify(usuarios, null, 2), 'utf-8');
    
    const datosPacientes = await fsPromises.readFile('data1/pacientes.json', 'utf-8');

    const pacientes = JSON.parse(datosPacientes);
    let idUltimoPaciente = 0;

    // Verificar si hay pacientes
    if (pacientes.length > 0) {
      const ultimoPaciente = pacientes[pacientes.length - 1];
      idUltimoPaciente = ultimoPaciente.id;
    }
    else {
      idUltimoPaciente = -1;
    }

    pacientes.push({ id: idUltimoPaciente + 1, id_usuario: datosRecibidos.id });
    await fsPromises.writeFile('data1/pacientes.json', JSON.stringify(pacientes, null, 2), 'utf-8');

    console.log('Datos guardados correctamente en pacientes.');

    res.status(200).send('Datos recibidos y guardados correctamente.');
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).send('Error interno del servidor.');
  }
});

app.get('/registro/idUltimoRegistro', async (req, res) => {
  try {
    const datos = await fsPromises.readFile('data1/usuarios.json', 'utf8');
    const usuarios = JSON.parse(datos);

    if (usuarios.length > 0) {
      res.json(usuarios[usuarios.length - 1]);
    } else {
      res.json({ error: 'No hay registros' });
    }
  } catch (error) {
    console.error('Error al leer el archivo de usuarios:', error);
    res.status(500).json({ error: 'No se pudo leer el archivo de usuarios' });
  }
});

const fs = require('fs');

app.get('/administradores/:idUsuario', (req, res) => {
  const idUsuario = parseInt(req.params.idUsuario);

  // Lógica para verificar si el usuario es administrador
  const administradores = JSON.parse(fs.readFileSync('data1/administradores.json', 'utf8'));
  const esAdministrador = administradores.some(admin => admin.id_usuario === idUsuario);
  console.log('idUsuario: ', idUsuario);
  console.log('administradores: ', administradores);
  console.log('esAdministrador: ', esAdministrador);

  res.json({ esAdministrador });
});

app.get('/doctores', (req, res) => {
  const usuarios = JSON.parse(fs.readFileSync('data1/usuarios.json', 'utf8'));
  const doctores = JSON.parse(fs.readFileSync('data2/doctores.json', 'utf8'));
  
  const doctoresConUsuarios = doctores.map(doctor => {
    const usuarioAsociado = usuarios.find(usuario => usuario.id === doctor.id_usuario);
  
    if (usuarioAsociado) {
      return { ...usuarioAsociado, doctor };
    }
  
    return { error: 'Usuario no encontrado', doctor }; // Devuelve un objeto indicando que no se encontró el usuario
  });
  
  console.log(doctoresConUsuarios);
  res.json(doctoresConUsuarios);
});

app.get('/doctores/:idUsuario', (req, res) => {
  const idUsuario = parseInt(req.params.idUsuario);

  // Lógica para verificar si el usuario es doctor
  const doctores = JSON.parse(fs.readFileSync('data2/doctores.json', 'utf8'));
  const esDoctor = doctores.some(admin => admin.id_usuario === idUsuario);

  console.log('idUsuario: ', idUsuario);
  console.log('doctores: ', doctores);
  console.log('esDoctor: ', esDoctor);

  res.json({ esDoctor });
});


app.get('/registros', async (req, res) => {
    const datos = await fsPromises.readFile('data1/usuarios.json', 'utf8');
    const registros = JSON.parse(datos);
    res.json(registros);
});

app.get('/pacientes', (req, res) => {
  const usuarios = JSON.parse(fs.readFileSync('data1/usuarios.json', 'utf8'));
  const pacientes = JSON.parse(fs.readFileSync('data1/pacientes.json', 'utf8'));
  
  const pacientesConUsuarios = pacientes.map(paciente => {
    const usuarioAsociado = usuarios.find(usuario => usuario.id === paciente.id_usuario);
  
    if (usuarioAsociado) {
      return { ...usuarioAsociado, paciente };
    }
    
    return { error: 'Usuario no encontrado', paciente }; // Devuelve un objeto indicando que no se encontró el usuario
  });
  
  //console.log(pacientesConUsuarios);
  res.json(pacientesConUsuarios);
});

app.get('/alergias', async (req, res) => {
  const datos = await fsPromises.readFile('data1/alergias.json', 'utf8');
  const alergias = JSON.parse(datos);
  res.json(alergias);
});

app.get('/citas', async (req, res) => {
  try {
    const idUsuario = req.query.idUsuario;
    console.log('ID de Usuario:', idUsuario);

    // Leer el archivo de pacientes
    const datosPacientes = await fsPromises.readFile('data1/pacientes.json', 'utf-8');
    const pacientes = JSON.parse(datosPacientes);

    // Leer el archivo de doctores
    const datosDoctores = await fsPromises.readFile('data2/doctores.json', 'utf-8');
    const doctores = JSON.parse(datosDoctores);

    // Leer el archivo de citas
    const datosCitas = await fsPromises.readFile('data2/citas.json', 'utf-8');
    const todasLasCitasDetalladas = JSON.parse(datosCitas);

    // Encontrar el usuario correspondiente al idUsuario
    const paciente = pacientes.find(p => p.id_usuario == idUsuario);
    const doctor = doctores.find(d => d.id_usuario == idUsuario);

    if (paciente) {
      // Filtrar citas basadas en el ID del paciente
      const citasUsuario = todasLasCitasDetalladas.filter(cita => cita.id_paciente == paciente.id);

      console.log('Citas para el Paciente:', citasUsuario);

      res.json(citasUsuario);
    } else if (doctor) {
      // Filtrar citas basadas en el ID del doctor
      const citasUsuario = todasLasCitasDetalladas.filter(cita => cita.id_doctor == doctor.id);

      console.log('Citas para el Doctor:', citasUsuario);

      res.json(citasUsuario);
    } else {
      console.log('Usuario no encontrado o no es paciente ni doctor');
      res.status(404).json({ error: 'Usuario no encontrado o no es paciente ni doctor' });
    }
  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({ error: 'Error interno del servidor al obtener citas', details: error.message });
  }
});

app.post('/registrarAlergia', async (req, res) => {
  try {
    const datosRecibidos = req.body;
    console.log('Datos recibidos:', datosRecibidos);

    const datosAntiguos = await fsPromises.readFile('data1/alergias.json', 'utf-8');
    const alergias = JSON.parse(datosAntiguos);

    alergias.push(datosRecibidos);

    await fsPromises.writeFile('data1/alergias.json', JSON.stringify(alergias, null, 2), 'utf-8');
    
    console.log('Datos guardados correctamente en alergias.');

    res.status(200).send('Datos recibidos y guardados correctamente.');
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).send('Error interno del servidor.');
  }
});

app.listen(puerto, () => {
  console.log(`El servidor está escuchando en el puerto ${puerto}`);
});

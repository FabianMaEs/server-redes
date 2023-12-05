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

    const datosAntiguos = await fsPromises.readFile('data/usuarios.json', 'utf-8');
    const usuarios = JSON.parse(datosAntiguos);

    usuarios.push(datosRecibidos);

    await fsPromises.writeFile('data/usuarios.json', JSON.stringify(usuarios, null, 2), 'utf-8');
    
    const datosPacientes = await fsPromises.readFile('data/pacientes.json', 'utf-8');

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
    await fsPromises.writeFile('data/pacientes.json', JSON.stringify(pacientes, null, 2), 'utf-8');

    console.log('Datos guardados correctamente en pacientes.');

    res.status(200).send('Datos recibidos y guardados correctamente.');
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).send('Error interno del servidor.');
  }
});

app.get('/registro/idUltimoRegistro', async (req, res) => {
  try {
    const datos = await fsPromises.readFile('data/usuarios.json', 'utf8');
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
  const administradores = JSON.parse(fs.readFileSync('data/administradores.json', 'utf8'));
  const esAdministrador = administradores.some(admin => admin.id_usuario === idUsuario);
  console.log('idUsuario: ', idUsuario);
  console.log('administradores: ', administradores);
  console.log('esAdministrador: ', esAdministrador);

  res.json({ esAdministrador });
});

app.get('/doctores', (req, res) => {
  const usuarios = JSON.parse(fs.readFileSync('data/usuarios.json', 'utf8'));
  const doctores = JSON.parse(fs.readFileSync('data/doctores.json', 'utf8'));
  
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
  const doctores = JSON.parse(fs.readFileSync('data/doctores.json', 'utf8'));
  const esDoctor = doctores.some(admin => admin.id_usuario === idUsuario);

  console.log('idUsuario: ', idUsuario);
  console.log('doctores: ', doctores);
  console.log('esDoctor: ', esDoctor);

  res.json({ esDoctor });
});


app.get('/registros', async (req, res) => {
    const datos = await fsPromises.readFile('data/usuarios.json', 'utf8');
    const registros = JSON.parse(datos);
    res.json(registros);
});

app.get('/pacientes', (req, res) => {
  const usuarios = JSON.parse(fs.readFileSync('data/usuarios.json', 'utf8'));
  const pacientes = JSON.parse(fs.readFileSync('data/pacientes.json', 'utf8'));
  
  const pacientesConUsuarios = pacientes.map(doctor => {
    const usuarioAsociado = usuarios.find(usuario => usuario.id === doctor.id_usuario);
  
    if (usuarioAsociado) {
      return { ...usuarioAsociado, doctor };
    }
  
    return { error: 'Usuario no encontrado', doctor }; // Devuelve un objeto indicando que no se encontró el usuario
  });
  
  console.log(pacientesConUsuarios);
  res.json(pacientesConUsuarios);
});

app.get('/alergias', async (req, res) => {
  const datos = await fsPromises.readFile('data/alergias.json', 'utf8');
  const alergias = JSON.parse(datos);
  res.json(alergias);
});

app.listen(puerto, () => {
  console.log(`El servidor está escuchando en el puerto ${puerto}`);
});

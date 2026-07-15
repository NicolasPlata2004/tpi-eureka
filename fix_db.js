const fs = require('fs');

const dbPath = './data/db.json';
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// New retos generation logic
const newRetos = {
  "lec-aritmetica": Array.from({ length: 5 }, (_, i) => ({
    id: `reto-aritmetica-${i + 1}`,
    tipo: "sustituidor",
    pregunta: `Encuentra el valor numérico de la expresión sustituyendo x = ${i + 2}, y = ${i + 1}`,
    variables: { x: i + 2, y: i + 1 },
    expresion: i % 2 === 0 ? "2x + y" : "x^2 - y",
    respuestaCorrecta: i % 2 === 0 ? (2 * (i + 2) + (i + 1)) : (Math.pow(i + 2, 2) - (i + 1)),
    pista: "Sustituye cada variable por su valor numérico y luego resuelve las operaciones."
  })),
  
  "lec-exponentes": Array.from({ length: 5 }, (_, i) => ({
    id: `reto-exponentes-${i + 1}`,
    tipo: "simplificador",
    pregunta: `Simplifica la siguiente expresión usando las leyes de los exponentes`,
    expresion: i % 2 === 0 ? `a^{${i+2}} \\cdot a^{${i+1}}` : `\\frac{x^{${i+4}}}{x^{${i+1}}}`,
    respuestaCorrecta: i % 2 === 0 ? `a^{${(i+2)+(i+1)}}` : `x^{${(i+4)-(i+1)}}`,
    pista: "Recuerda: si multiplicas sumas los exponentes, si divides los restas."
  })),
  
  "lec-balanza": Array.from({ length: 5 }, (_, i) => {
    // Generar 5 ecuaciones lineales
    const x = i + 2;
    const a = 2 + (i % 2); // 2 o 3 cajas
    const b = (i % 3) + 1; 
    const c = (a * x) + b;
    
    return {
      id: `reto-balanza-${i + 1}`,
      tipo: "balanza",
      pregunta: "Encuentra el valor de x aislando las cajas en la balanza.",
      ecuacionOriginal: `${a}x + ${b} = ${c}`,
      platilloIzquierdo: { terminos: Array(a).fill("x").concat(Array(b).fill("1")), mostrarTres: false },
      platilloDerecho: { valor: c },
      pista: "Mueve los números a la mesa para equilibrar y luego divide las cajas."
    };
  }),
  
  "lec-productos": Array.from({ length: 5 }, (_, i) => ({
    id: `reto-productos-${i + 1}`,
    tipo: "areas",
    pregunta: "Arma el modelo geométrico para la expresión $(a+b)^2$",
    expresion: "(a+b)^2",
    modelo: "cuadrado_binomio",
    piezas: ["a^2", "ab", "ab", "b^2"],
    pista: "Arrastra las piezas para formar un cuadrado perfecto de lado (a+b)."
  })),
  
  "lec-diferencia": Array.from({ length: 5 }, (_, i) => ({
    id: `reto-diferencia-${i + 1}`,
    tipo: "areas",
    pregunta: "Arma el modelo geométrico para la expresión $a^2 - b^2$",
    expresion: "a^2 - b^2",
    modelo: "diferencia_cuadrados",
    piezas: ["a^2", "b^2"],
    pista: "Muestra cómo al quitar el cuadrado pequeño (b²) queda una figura en forma de L."
  })),
  
  "lec-pitagoras": Array.from({ length: 5 }, (_, i) => ({
    id: `reto-pitagoras-${i + 1}`,
    tipo: "areas",
    pregunta: "Demuestra el Teorema de Pitágoras $a^2 + b^2 = c^2$",
    expresion: "a^2 + b^2 = c^2",
    modelo: "pitagoras",
    piezas: ["a^2", "b^2"],
    pista: "Mueve las piezas de los catetos para cubrir la hipotenusa (c²)."
  }))
};

db.retos = newRetos;
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log('db.json updated with 5 challenges per lesson.');

var descripcion_ejemplo = " 2 habitaciones amplias, luminosas. Una de ellas tiene terraza. Cocina, baño y salón a compartir. Económico, 200 euros, (incluido wifi, comunidad y calefacción) más gastos de luz y agua";
var anuncio_lista;
angular
  .module('ComPiApp', [])
  .controller("controlador", controlador);
function controlador($scope, $http){
	var vm = this;
	vm.pedir = function(URL){
		console.log("pidiendo");
		$http({
		    method: 'GET', 
		    url: anuncio_juventud.URL + anuncio_juventud.peticion
			}).success(function(data, status, headers, config) {
		    	console.log(data.result);
		    	filtro_ID(data.result,function(vector){
		    		vm.anuncio_lista = vector;
		    		busqueda_precios(vector[8].description+ " "+ vector[8].title,function(precio){
		    			console.log(precio);
		    			console.log(vector[8].description+ " "+ vector[8].title);
		    		});
		    	});
			}).error(function(data, status, headers, config) {     alert("Ha fallado la petición. Estado HTTP:"+status);
		});
	}
}
function filtro_ID(datos,cb){
	var vector_ID=[];
	datos.forEach(function(dato,i){
		var id = dato.tipo.id;
		if(id === 1 || id === 2){
			vector_ID.push(dato);
			//Solo nos interesan los que tratan sobre compartir piso
		}
	});
	cb(vector_ID);
}
function anuncio_computado(titulo,descripcion,id,posicion,precio,calle,zona,habitaciones){
	this.titulo = titulo;
	this.descripcion = descripcion;
	this.id = id;
	this.posicion = posicion;
	this.habitaciones = habitaciones;
	this.precio = precio;
	this.calle = calle;
	this.zona = zona;
}
function dividir_cadena(cadena){
	var frases_split_punto = cadena.split(".");
	var frases = [];
	frases_split_punto.forEach(function(dato,i){
		frases.push(eliminar_paja(dato));
	});
	return frases;
}
function busqueda_precios(frase,cb){
	var clave_precio = ["precio", "euros", "euro","eur","€"];
	//Split de palabras y buscar en ellas las palabrras clave
	var precio = 0;
	var encontrado = false;
	var i = 0;
	var j = 0;
	while(encontrado === false && i < frase.length){
		j=0;
		while(encontrado === false && j < clave_precio.length){
			if(validar_clave(frase[i], clave_precio[j]) ){
				var w = i-2;
				while(encontrado === false && w < i+2){
					var numero = encontrar_int(frase[w]);
					if(isNaN(numero) === false){
						precio = numero;
						encontrado = true;
					}
					w++;
				}
			}
			j++;
		}
		i++;
	}
	cb(precio);
}
//Si encuentra la palabra clave en una palabra devuelve true
//Ejemplo: validar_clave("euros/persona","euros")->true
function validar_clave(palabra, clave){
	var devolver = false;
	var i = 0;
	//Aplicar un mejor algoritmo de busqueda
	var seguidas = 0;
	var j = 0;
	while(devolver === false && i < palabra.length){
		j=i;
		while(devolver === false && j < palabra.length && j-i < clave.length){
			if(seguidas >= clave.length){
				devolver = true;
			}
			if(palabra.charAt(j) === clave.charAt(j-i)){
				seguidas++;
			}
			j++;
		}
		i++;
	}
	return devolver;
}
function encontrar_int(palabra){
	var numero ="";
	var encontrado = false;
	for(var i = 0; i< palabra.length; i++){
		var caracter = palabra.charAt(i);
		if(isNaN(parseInt(caracter)) == false){
			encontrado = true;
			numero = numero + caracter;
		}else{
			if(encontrado == true){
				return parseInt(numero);
			}
		}
	}
	return parseInt(numero);
}
function prueba(){
	//console.log(encontrar_int("alfaasdasd"));
	//console.log(encontrar_int("alfa1890beta45"));
	//console.log(eliminar_paja(descripcion_ejemplo));
	/*
	busqueda_precios(eliminar_paja(descripcion_ejemplo),function(precio){
		console.log(precio);
	});
	*/
	dividir_cadena(descripcion_ejemplo);
}

var anuncio_juventud = {};
anuncio_juventud.URL= "http://www.zaragoza.es/api/recurso/cultura-ocio/anuncio-juventud";
anuncio_juventud.peticion ="?start=0&rows=2000";
anuncio_juventud.insertar_anuncio="http://www.zaragoza.es/ciudad/sectores/jovenes/cipaj/cont/insertaranuncios.htm"; 
	//URL de la API de anuncios para jovenes
	/*
	fl : Listado de atributos separados por comas que
		se desea obtener en la respuesta.
	rf :  Formato de textos enriquecidos, por defecto html.
	start : Posición del primer registro que se obtendra.
	rows : Numero de filas que se obtendran.
	sort : Ordenacion de los campos.
	q : Consulta con sintaxis FIQL.
	?fl=...&rf=...&start=...&rows=...&sort=...&sort=...&q=...
	*/
	/*
	{
	  "contacto": "string",
	  "title": "string",
	  "provincia": "string",
	  "description": "string",
	  "creationDate": "Date",
	  "tipo": "TipoAnuncio",
	  "pais": "string",
	  "poblacion": "string",
	  "id": "int"
	}
	id = 1 "Alojamientos (demanda)";
		2 "Alojamientos (oferta)";
		9 "Gente"; 
		10 "Intercambios - compartimos"; 
	*/

var estaciones_bici = {};
estaciones_bici.URL = "http://www.zaragoza.es/api/recurso/urbanismo-infraestructuras/estacion-bicicleta";
estaciones_bici.peticion="?start=0&rows=2000&srsname=wgs84";

/* Analizador sintáctico de oraciones. 
Elimina la paja (palabras menores de 2 letras que no sean numeros) 
asi como preposiciones, articulos, conjunciones...
*/
var clave = ["los","las","ante", "bajo", "con", "contra","desde","entre", "durante", "hacia", "hasta", "mediante", "para", "por", "según", "sin", "sobre", "tras","pero","sino","que","como","mas","porque","puesto","luego","con","para","aunque","muy"];
function eliminar_paja(cadena){
	var cadena_split = cadena.split(" ");
	var cadena_computada = [];
	cadena_split.forEach(function(dato,i){
		//Si es un número no eliminamos la palabra
		if(isNaN(parseInt(dato)) == false){
			cadena_computada.push(dato);
		}else if(dato.length <= 2){
			//No se añade(se elimina)
		}else if(esClave(dato)){
			//Si es una palabra dentro del vector clave no aporta informacion util y se desecha
		}else{
			cadena_computada.push(dato);
		}
	});
	return cadena_computada;
}
function esClave(palabra){
	var devuelve = false;
	var i = 0;
	while(devuelve === false && i <clave.length){
		if(palabra === clave[i]){
			devuelve = true;
		}
		i++;
	}
	return devuelve;
}

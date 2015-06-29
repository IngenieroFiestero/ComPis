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
//Parametros: amueblado, habitaciones maximas, precio limite,
function busqueda_precios(palabras,cb){
	var clave_precio = ["precio", "euros", "euro","eur","€"];
	//Split de palabras y buscar en ellas las palabrras clave
	var vec_split = palabras.split(" ");
	var precio = 0;
	var encontrado = false;
	vec_split.forEach(function(dato,i){
		if(encontrado == false){
			clave_precio.forEach(function(dat_precio,i_precio){
				if(validar_clave(dato,dat_precio)){
					for(j=i-2;j < i+2;j++){
						if(isNaN(parseInt(vec_split[j])) === false){
							precio = parseInt(vec_split[j]);
							encontrado = true;
						}
					}
				}
			});
		}
	});
	cb(precio);
}
function validar_clave(palabra,clave){
	var j = 0;
	for(var i = 0; i<palabra.length;i++){
		var caracter = palabra.charAt(i);
		if(caracter == clave.charAt(j)){
			j++;
			if(j>= clave.length){
				return true;
			}
		}
	}
}
function encontrar_int(palabra){
	var numero ="";
	var encontrado = false;
	for(var i = 0; i< palabra.length; i++){
		var caracter = palabra.charAt(i);
		if(isNaN(parseInt(caracter)) == false){
			encontrado = true;
			precio = precio + caracter;
		}else{
			if(encontrado == true){
				return parseInt(precio);
			}
		}
	}
	return parseInt(precio);
}

var anuncio_juventud = {};
anuncio_juventud.URL= "http://www.zaragoza.es/api/recurso/cultura-ocio/anuncio-juventud";
anuncio_juventud.peticion ="?start=0&rows=2000";
anuncio_juventud.insertar_anuncio="http://www.zaragoza.es/ciudad/sectores/jovenes/cipaj/cont/insertaranuncios.htm"; 
console.log(anuncio_juventud);
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
function pedir(){
	generar_peticiones(anuncio_juventud.URL + anuncio_juventud.peticion);
}

function generar_peticion(URL){
	$.getJSON(URL,function(data, status){
		if(status==="success"){
			//Los resultados no muestran ni telefono ni email, por lo que hay que hacer scraping en la web
			//http://www.zaragoza.es/juventud/cipaj/anuncios/obtenerAnuncio?cl= id
			anuncio_lista = data.result;
			console.log(anuncio_lista);
		}else{
			console.log(status);
		}
	});
}
function obtener_contacto(id,cb){

	cb(phone,email);
}
function generar_posicion(){
	//Genera una geolocalizacion aproxiada sabiendo el nombre de la calle.

}
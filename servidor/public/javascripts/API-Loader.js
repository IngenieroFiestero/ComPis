/*
	ComPis: Aplicacion para trabajar con la API del ayuntamiento de zaragoza
	
	Utiliza algoritmos para encontrar datos dentro de la descripcion y el titulo como el precio, la calle, la zona...
*/

var anuncio_juventud = {};
anuncio_juventud.URL= "http://www.zaragoza.es/api/recurso/cultura-ocio/anuncio-juventud";
anuncio_juventud.peticion ="?start=0&rows=2000";
anuncio_juventud.insertar_anuncio="http://www.zaragoza.es/ciudad/sectores/jovenes/cipaj/cont/insertaranuncios.htm"; 
anuncio_juventud.ver_anuncio="http://www.zaragoza.es/juventud/cipaj/anuncios/obtenerAnuncio?cl=";
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

var descripcion_ejemplo = "Se alquila piso para estudiantes de septiembre a junio. Tres habitaciones, 2º con ascensor, amueblado, con calefacción y aire acondicionado";
angular
  .module('ComPiApp', [])
  .controller("controlador", controlador);
function controlador($scope, $http){
	var vm = this;
	vm.anuncio_computado = [];
	vm.anuncio_lista = [];
	vm.pedir = function(URL,cb){
		console.log("pidiendo");
		$http({
		    method: 'GET', 
		    url: anuncio_juventud.URL + anuncio_juventud.peticion
			}).success(function(data, status, headers, config) {
		    	console.log(data.result);
		    	filtro_ID(data.result,function(vector){
		    		vm.anuncio_lista = vector;
		    		vector.forEach(function(dato,i){
		    			var cadena = remover_acentos(dato.title + ". " + dato.description);
		    			var resultado = filtrar(dividir_cadena(cadena));
		    			resultado.titulo = dato.title;
		    			resultado.descripcion = dato.description;
		    			resultado.id = dato.id;
		    			resultado.ciudad = dato.poblacion;
		    			resultado.fecha = dato.creationDate;
		    			resultado.contacto = dato.contacto;
		    			resultado.prec = resultado.precio;
		    			resultado.hab = resultado.habitaciones;
		    			resultado.URL = anuncio_juventud.ver_anuncio +resultado.id;
		    			if(resultado.precio === 100000){
		    				resultado.prec = "";
		    			}
		    			if(resultado.hab === 0){
		    				resultado.hab = "";
		    			}
		    			vm.anuncio_computado.push(resultado);
		    			vm.first_time = false;
		    		});
		    		console.log(vm.anuncio_computado);
		    		cb();
		    	});
			}).error(function(data, status, headers, config) {     
				alert("Ha fallado la petición. Estado HTTP: "+status);
		});
	}
	vm.first_time = true;
	vm.anuncios_filtrados= [];
	vm.filtro = {};//Filtro de busquedas
	vm.filtro.genero = "Ambos";
	vm.load = function(){
		if(vm.first_time){
			vm.pedir(anuncio_juventud.URL + anuncio_juventud.peticion,vm.filtrar);
		}else{
			vm.filtrar();
		}
	}
	vm.filtrar = function(){
		vm.anuncios_filtrados= [];
		var genero = vm.filtro.genero || "Ambos";
		var garaje = vm.filtro.garaje || false;
		var precio = vm.filtro.precio_maximo || 100000;
		var visu = vm.filtro.visualizacion || false;
		var habitaciones = vm.filtro.habitaciones || -1;
		vm.anuncio_computado.forEach(function(dato,i){
			var eliminar = false;
			if(garaje && dato.garaje === false){
				eliminar = true;
			}
			if(dato.precio > precio && visu ===false){
				if(visu && dato.precio === 100000){
					
				}else{
					eliminar = true;
				}
			}
			if(dato.habitaciones <= habitaciones){
				if(visu && dato.habitaciones === 0){

				}else{
					eliminar = true;
				}
			}
			if(eliminar === false){
				vm.anuncios_filtrados.push(dato);
			}
		});
		console.log(vm.anuncios_filtrados);
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
function dividir_cadena(cadena){
	var frases_split_punto = cadena.split(".");
	var frases = [];
	frases_split_punto.forEach(function(dato,i){
		frases.push(eliminar_paja(dato));
	});
	return frases;
}

function array_booleano(longitud,valor){
	var array = new Array(longitud);
	for(var i = 0; i < array.length;i++){
		array[i] =valor;
	}
	return array;
}
function filtrar(frases){
	var encontrados = array_booleano(5,false);
	var respuesta = {};
	respuesta.precio = 100000;
	respuesta.habitaciones = 0;
	respuesta.garaje = false;
	var frase;
	var cb = [];
	var claves = [];
	//Precio, posicion=0
	claves.push(["precio", "euros", "euro","eur","€"]);
	cb.push(function(i,j,w){
		if(encontrados[j] === false){
			var z = i-1;
			while(z < i+1){
				if(frase[z]){
					var numero = encontrar_int(frase[z]);
					if(isNaN(numero) === false){
						respuesta.precio = numero;
						encontrados[j] = true;
					}
				}
				z++;
			}
		}
	});
	//Calle, posicion=1
	claves.push(["calle","plaza","puente","avenida","pza","C/"]);
	cb.push(function(i,j,w){
		if(encontrados[j] === false){
			var z = i + 1;
			var mayusculas = buscar_mayusculas(frase.slice(i+1,i+3));
			respuesta.calle = claves[j][w]+ " " + mayusculas.join(" ");
			encontrados[j] = true;
		}
	});
	//Zona
	claves.push(["zona","proximo","sector","estacion","hospital","hotel","actur","universidad","cps","facultad"]);
	cb.push(function(i,j,w){
		if(encontrados[j] === false){
			var z = i + 1;
			respuesta.zona = claves[j][w]+ " " +  buscar_mayusculas(frase.slice(i+1,i+3)).join(" ");
			encontrados[j] = true;
		}
	});
	claves.push(["dormitorio","habitacion"]);
	cb.push(function(i,j,w){
		if(encontrados[j] === false){
			var z = i + 1;
			var subfrase =frase.slice(i-1,i+1);
			subfrase.forEach(function(dato,ind){
				var hab = encontrar_int(dato);
				if(hab >=0){
					respuesta.habitaciones = hab;
					encontrados[j] = true;
				}
			});
		}
	});
	claves.push(["garaje","cochera"]);
	cb.push(function(i,j,w){
		if(encontrados[j] === false){
			console.log("garaje encontrado");
			respuesta.garaje=true;
		}
	});
	frases.forEach(function(dato,index){
		frase = dato;
		//Filtrado
		filtro_general(frase,claves,cb);
	});
	return respuesta;
}
function remover_acentos(str) {
	var map={'À':'A','Á':'A','Â':'A','Ã':'A','Ä':'A','Å':'A','Æ':'AE','Ç':'C','È':'E','É':'E','Ê':'E','Ë':'E','Ì':'I','Í':'I','Î':'I','Ï':'I','Ð':'D','Ò':'O','Ó':'O','Ô':'O','Õ':'O','Ö':'O','Ø':'O','Ù':'U','Ú':'U','Û':'U','Ü':'U','Ý':'Y','ß':'s','à':'a','á':'a','â':'a','ã':'a','ä':'a','å':'a','æ':'ae','ç':'c','è':'e','é':'e','ê':'e','ë':'e','ì':'i','í':'i','î':'i','ï':'i','ò':'o','ó':'o','ô':'o','õ':'o','ö':'o','ø':'o','ù':'u','ú':'u','û':'u','ü':'u','ý':'y','ÿ':'y','Ā':'A','ā':'a','Ă':'A','ă':'a','Ą':'A','ą':'a','Ć':'C','ć':'c','Ĉ':'C','ĉ':'c','Ċ':'C','ċ':'c','Č':'C','č':'c','Ď':'D','ď':'d','Đ':'D','đ':'d','Ē':'E','ē':'e','Ĕ':'E','ĕ':'e','Ė':'E','ė':'e','Ę':'E','ę':'e','Ě':'E','ě':'e','Ĝ':'G','ĝ':'g','Ğ':'G','ğ':'g','Ġ':'G','ġ':'g','Ģ':'G','ģ':'g','Ĥ':'H','ĥ':'h','Ħ':'H','ħ':'h','Ĩ':'I','ĩ':'i','Ī':'I','ī':'i','Ĭ':'I','ĭ':'i','Į':'I','į':'i','İ':'I','ı':'i','Ĳ':'IJ','ĳ':'ij','Ĵ':'J','ĵ':'j','Ķ':'K','ķ':'k','Ĺ':'L','ĺ':'l','Ļ':'L','ļ':'l','Ľ':'L','ľ':'l','Ŀ':'L','ŀ':'l','Ł':'L','ł':'l','Ń':'N','ń':'n','Ņ':'N','ņ':'n','Ň':'N','ň':'n','ŉ':'n','Ō':'O','ō':'o','Ŏ':'O','ŏ':'o','Ő':'O','ő':'o','Œ':'OE','œ':'oe','Ŕ':'R','ŕ':'r','Ŗ':'R','ŗ':'r','Ř':'R','ř':'r','Ś':'S','ś':'s','Ŝ':'S','ŝ':'s','Ş':'S','ş':'s','Š':'S','š':'s','Ţ':'T','ţ':'t','Ť':'T','ť':'t','Ŧ':'T','ŧ':'t','Ũ':'U','ũ':'u','Ū':'U','ū':'u','Ŭ':'U','ŭ':'u','Ů':'U','ů':'u','Ű':'U','ű':'u','Ų':'U','ų':'u','Ŵ':'W','ŵ':'w','Ŷ':'Y','ŷ':'y','Ÿ':'Y','Ź':'Z','ź':'z','Ż':'Z','ż':'z','Ž':'Z','ž':'z','ſ':'s','ƒ':'f','Ơ':'O','ơ':'o','Ư':'U','ư':'u','Ǎ':'A','ǎ':'a','Ǐ':'I','ǐ':'i','Ǒ':'O','ǒ':'o','Ǔ':'U','ǔ':'u','Ǖ':'U','ǖ':'u','Ǘ':'U','ǘ':'u','Ǚ':'U','ǚ':'u','Ǜ':'U','ǜ':'u','Ǻ':'A','ǻ':'a','Ǽ':'AE','ǽ':'ae','Ǿ':'O','ǿ':'o'};
	var res="";
	for (var i=0;i<str.length;i++){
		c=str.charAt(i);
		res+=map[c]||c;
	}
	return res;
}
function buscar_mayusculas(frase){
	var mayusculas = [];
	frase.forEach(function(dato,i){
		var caracter = dato.charAt(0);
		if(caracter == caracter.toUpperCase()){
			mayusculas.push(dato);
		}
	});
	return mayusculas;
}
function filtro_general(frase,claves,cb){
	//claves es un array que contiene en cada posicion un array de claves
	//cb es un array de callbacks
	var i = 0;
	var j = 0;
	var encontrado = false;
	var encontrados = array_booleano(claves.length,false);
	//Recorremos palabra por palabra
	while(encontrado === false && i < frase.length){
		j=0;
		//recorremos cada conjunto de claves
		while(encontrado === false && j < claves.length){
			//Ahora hay que recorrer cada clave
			//Pero si ya hemos encontrado una clave de ese conjunto en nuestra frase ni siquiera probamos a buscar mas valores
			if(encontrados[j] === false){
				var w=0;
				while(encontrados[j] === false && w < claves[j].length){
					if(frase[i].toLowerCase().search(claves[j][w]) >=0){
						//Hacemos que se encargue el callback
						//Nosotros ya hemos encontrado la posicion y no volveremos a buscar para ese filtro
						//Estos parametros son:
						//i=pos palabra,j=pos diccionario,w = pos clave
						cb[j](i,j,w);
						encontrados[j] = true;
					}
					w++;
				}
			}
			j++;
		}
		i++;
		encontrado = allTrue(encontrados);
	}
}
function allTrue(vector){
	var devolver = true;
	var i = 0;
	while(devolver == true && i < vector.length){
		if(vector[i] === false){
			devolver = false;
		}
		i++;
	}
	return devolver;
}

//Si encuentra la palabra clave en una palabra devuelve true
//Ejemplo: validar_clave("euros/persona","euros")->true

function encontrar_int(palabra){
	var numero ="";
	var encontrado = false;
	var clave = ["cero","uno","dos","tres","cuatro","cinco","seis","siete","ocho","nueve","diez"];
	var i = 0;
	var salir = false;
	palabra = palabra.toLowerCase();
	while(encontrado === false && i < clave.length){
		if(palabra.search(clave[i])>=0){
			encontrado = true;
			salir = true;
			numero = i;
		}
		i++;
	}
	var i = 0;
	while(salir === false && i < palabra.length){
		var caracter = palabra.charAt(i);
		if(isNaN(parseInt(caracter)) == false){
			encontrado = true;
			numero = numero + caracter;
		}else{
			if(encontrado == true){
				salir = true;
			}
		}
		i++;
	}
	return parseInt(numero);
}
function prueba(){
	//console.log(encontrar_int("alfaasdasd"));
	//console.log(encontrar_int("alfa1890beta45"));
	//console.log(eliminar_paja(descripcion_ejemplo));
	
	/*busqueda_precios(eliminar_paja(descripcion_ejemplo),function(precio){
		console.log(precio);
	});*/
	//filtrar(dividir_cadena(descripcion_ejemplo));
	//console.log(descripcion_ejemplo.search("euro"));
	//dividir_cadena(descripcion_ejemplo);
	var cadena = remover_acentos(descripcion_ejemplo);
	var resultado = filtrar(dividir_cadena(cadena));
	console.log(resultado);
}
/* 
	Analizador sintáctico de oraciones:
	
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

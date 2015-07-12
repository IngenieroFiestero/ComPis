/*
	ComPis: Aplicacion para trabajar con la API del ayuntamiento de zaragoza
	
	Utiliza algoritmos para encontrar datos dentro de la descripcion y el titulo como el precio, la calle, la zona...
*/

var anuncio_juventud = {};
anuncio_juventud.URL= "http://www.zaragoza.es/api/recurso/cultura-ocio/anuncio-juventud";
anuncio_juventud.peticion ="?start=0&rows=2000";
anuncio_juventud.insertar_anuncio="http://www.zaragoza.es/ciudad/sectores/jovenes/cipaj/cont/insertaranuncios.htm"; 
anuncio_juventud.ver_anuncio="http://www.zaragoza.es/juventud/cipaj/anuncios/obtenerAnuncio?cl=";
var icono_glyp = {};
icono_glyp.on="glyphicon-eye-close";
icono_glyp.off="glyphicon-eye-open";
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
var fav_cook_name = "favorite";
var estaciones_bici = {};
estaciones_bici.URL = "http://www.zaragoza.es/api/recurso/urbanismo-infraestructuras/estacion-bicicleta";
estaciones_bici.peticion="?start=0&rows=2000&srsname=wgs84";

var descripcion_ejemplo = "Se alquila piso para estudiantes de septiembre a junio. Tres habitaciones, 2º con ascensor, amueblado, con calefacción y aire acondicionado";

var app = angular.module('ComPiApp', ['ui.bootstrap', 'ui.router', 'ui.navbar']);
app.controller("filtroController", filtroController);
app.controller("viewController",viewController);
app.controller('NavigationController', function($scope) {

  $scope.tree = [{
    name: "La aplicacion",
    link: "#",
  }, {
    name: "Desarollador",
    link: "#",
  }, {
    name: "divider",
    link: "#"

  }, {
    name: "Colabora Ayuntamiento Zaragoza",
    link: "#"
  }];
});
app.service('dataExchangeService',dataExchangeService);
function dataExchangeService(){
	this.vm ={};
	this.vm.anuncio_computado = function(lista){
		if(lista){
			var anuncios_favoritos =[];
			lista.forEach(function(dato,i){
				if(dato.icono == icono_glyp.on){
					anuncios_favoritos.push(dato.id);
				}else{
				}
			});
			var d = new Date();
		    d.setTime(d.getTime() + (10*24*60*60*1000));
		    var expires = "expires="+d.toUTCString();
			document.cookie=fav_cook_name + "="+anuncios_favoritos.join("-")+";"+expires;
		}else{
		}
		
	}
	this.vm.anuncio_computado.lista = [];
	this.vm.anuncio_lista = [];
	this.vm.filtro = {};
	this.vm.anuncios_filtrados = [];
	this.vm.first_time = true;
	this.vm.filtro.genero = "Ambos";
}
function viewController($scope,dataExchangeService){
	this.view = dataExchangeService.vm;
}
function filtroController($scope, $http,dataExchangeService){
	this.filtro = dataExchangeService.vm.filtro;
	var vm = dataExchangeService.vm;
	var anuncios_favoritos={};
	this.load = function(){
		if(vm.first_time){
			anuncios_favoritos = getCookie(fav_cook_name).split("-");
			this.pedir(anuncio_juventud.URL + anuncio_juventud.peticion,this.filtrar);
		}else{
			this.filtrar();
		}
	}
	this.pedir = function(URL,cb){
		$http({
		    method: 'GET', 
		    url: anuncio_juventud.URL + anuncio_juventud.peticion
			}).success(function(data, status, headers, config) {
		    	filtro_ID(data.result,function(vector){
		    		vm.anuncio_lista = vector;
		    		vector.forEach(function(dato,i){
		    			var cadena = remover_acentos(dato.title + ". " + dato.description);
		    			var resultado = filtrar(dividir_cadena(cadena));
		    			resultado.titulo = dato.title;
		    			resultado.descripcion = dato.description;
		    			resultado.telefono = dato.telefono;
		    			resultado.id = dato.id;
		    			resultado.ciudad = dato.poblacion;
		    			resultado.fecha = dato.creationDate;
		    			resultado.contacto = dato.contacto;
		    			resultado.URL = anuncio_juventud.ver_anuncio +resultado.id;
		    			//colocar favoritos
		    			var encontrado = false;
		    			var j = 0;
		    			while(encontrado == false && j < anuncios_favoritos.length){
		    				if(anuncios_favoritos[j] == dato.id){
		    					resultado.icono = icono_glyp.on;
		    					encontrado = true;
		    				}
		    				j++;
		    			}
		    			if(resultado.precio){
		    				resultado.vPrecio = resultado.euros.toString();
		    			}else{
		    				resultado.vPrecio = "";
		    			}
		    			if(resultado.hab){
		    				resultado.vHab = resultado.nHab.toString();
		    			}else{
		    				resultado.vHab = "";
		    			}
		    			vm.anuncio_computado.lista.push(resultado);
		    		});
		    		console.log(vm.anuncio_computado.lista);
		    		vm.first_time = false;
		    		cb();
		    	});
			}).error(function(data, status, headers, config) {     
				alert("Ha fallado la petición. Estado HTTP: "+status);
		});
	}
	this.filtrar = function(){
		//Variables con f delante tson utilizadas por el filtro
		vm.anuncios_filtrados= [];
		var fCompañero;
		var fCompañera;
		var fFav = vm.filtro.favoritos || false;
		if(vm.filtro.genero == "Compañero"){
			fCompañero = true;
			fCompañera = false;
		}else if(vm.filtro.genero == "Ambos"){
			fCompañero = true;
			fCompañera = true;
		}else if(vm.filtro.genero == "Compañera"){
			fCompañero = false;
			fCompañera = true;
		}
		var fGaraje = vm.filtro.garaje || false;
		var fEuros = encontrar_int(vm.filtro.precio || 100000);
		var fPrecio = true;
		if(fEuros === 100000){
			fPrecio = false;
			vm.filtro.vPrecio = "";
		}
		var fVisu = vm.filtro.visualizacion || false;
		var fHabitaciones = encontrar_int(vm.filtro.habitaciones || 0);
		if(fHabitaciones == 0){
			fHab = false;
		}
		vm.anuncio_computado.lista.forEach(function(dato,i){
			var eliminar = false;
			if(fGaraje && dato.garaje === false){
				eliminar = true;
			}
			if(fPrecio){
				//Si filtramos por prercio
				if(fVisu && dato.precio == false){
					
				}else if(dato.precio == false){
					eliminar = true;
				}else if(dato.euros > fEuros){
					eliminar = true;
				}
			}
			if(fHab && dato.nHab <= fHabitaciones){
				if(fVisu && dato.nHab === 0){

				}else{
					eliminar = true;
				}
			}
			//Filtrar por genero
			if((fCompañero && fCompañera) && (dato.compañero === false  && dato.compañera === false)){
				eliminar = true;
			}else if(fCompañero && fCompañera === false &&(dato.compañera === true ||dato.compañero === false)){
				eliminar = true;
			}else if(fCompañera && fCompañero === false && (dato.compañera === false ||dato.compañero === true)){
				eliminar = true;
			}
			if(fFav && dato.icono == icono_glyp.off){
				eliminar = true;
			}
			if(eliminar === false){
				vm.anuncios_filtrados.push(dato);
			}
		});
		console.log(vm.anuncios_filtrados);
	}
}
//Eliminar ids innecesarias
function filtro_ID(datos,cb){
	var vector_ID=[];
	datos.forEach(function(dato,i){
		var id = dato.tipo.id;
		if(id === 2){
			vector_ID.push(dato);
			//Solo nos interesan los que tratan sobre compartir piso
		}
	});
	cb(vector_ID);
}
function dividir_cadena(cadena){
	var frases_split_punto = cadena.split(/[,|.]/);
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
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
} 
function filtrar(frases){
	var encontrados = [];
	var respuesta = {};
	respuesta.precio = false;
	respuesta.euros = 0;
	respuesta.nHab = 0;
	respuesta.han = false;
	respuesta.garaje = false;
	respuesta.compañero = true;
	respuesta.compañera = true;
	respuesta.fav = function(icono){
		if(icono){
			this.icono = icono;
		}else{
			if(this.icono === icono_glyp.off){
				this.icono = icono_glyp.on;
			}else if(this.icono === icono_glyp.on){
				this.icono = icono_glyp.off;
			}
		}	
	}
	respuesta.fav(icono_glyp.off);
	var frase;
	var cb = [];
	var claves = [];
	//Precio, posicion=0
	encontrados.push(false);
	claves.push(["precio", "euros", "euro","eur","€"]);
	cb.push(function(i,j,w,callMe){
		if(encontrados[j] === false){
			var z = i-1;
			while(z < i+1 && encontrados[j] === false){
				if(frase[z]){
					var numero = encontrar_int(frase[z]);
					if(isNaN(numero) === false){
						respuesta.precio = true;
						respuesta.euros = numero;
						encontrados[j] = true;
					}
				}
				z++;
			}
		}
	});
	encontrados.push(false);
	claves.push(["dormitorio","habitacion"]);
	cb.push(function(i,j,w,callMe){
		if(encontrados[j] === false){
			var z = i + 1;
			var subfrase =frase.slice(i-1,i+1);
			subfrase.forEach(function(dato,ind){
				var nHab = encontrar_int(dato);
				if(nHab >=0){
					respuesta.hab = true;
					respuesta.nHab = nHab;
					encontrados[j] = true;
					callMe(true);
				}
			});
		}
	});
	encontrados.push(false);
	claves.push(["compañero","compañera","compañer@"]);
	cb.push(function(i,j,w,callMe){
		if(encontrados[j] === false){
			//Si se encuentra la palabra clave, normalmente es porque incluye garaje
			if(w === 0){
				respuesta.compañero = true;
				respuesta.compañera = false;
				callMe(true);
			}else if(w === 1){
				respuesta.compañero = false;
				respuesta.compañera = true;
				callMe(true);
			}else if(w === 2){
				respuesta.compañero = true;
				respuesta.compañera = true;
				callMe(true);
			}
		}
	});
	encontrados.push(false);
	claves.push(["garaje","cochera","aparcamiento"]);
	cb.push(function(i,j,w,callMe){
		if(encontrados[j] === false){
			//Si se encuentra la palabra clave, normalmente es porque incluye garaje
			respuesta.garaje=true;
			callMe(true);
		}
	});
	frases.forEach(function(dato,index){
		frase = dato;
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
						cb[j](i,j,w,function(poner_true){
							//Hacemos que cuando acabe de trabajar cada callback
							//Diga si hay que ponerlo a true o no, pues puede darse un falso positivo
							encontrados[j] = true;
						});
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
	//True si todos los datos del vector son booleanos y estan a true
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
	//var cadena = remover_acentos(descripcion_ejemplo);
	//var resultado = filtrar(dividir_cadena(cadena));
	console.log(descripcion_ejemplo);
	console.log(descripcion_ejemplo.split(/[,|.]/));
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
function encontrar_int(palabra){
	palabra=palabra.toString();
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

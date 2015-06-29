var clave_articulo =["el","la","lo","los","las"];
var clave_preposicion = ["a", "ante", "bajo", "con", "contra", "de", "desde","en","entre" "durante", "hacia", "hasta", "mediante", "para", "por", "según", "sin", "sobre", "tras"];
var clave_conjuncion = ["y","e","ni","o","u","pero","sino","que","si","como","mas","porque","puesto","luego","con","para","aunque","si"];
var clave = ["los","las","ante", "bajo", "con", "contra","desde","entre" "durante", "hacia", "hasta", "mediante", "para", "por", "según", "sin", "sobre", "tras""pero","sino","que","como","mas","porque","puesto","luego","con","para","aunque",];
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
	clave.forEach(function(dato,i){
		if(palabra === dato){
			return true;
		}
	});
	return false;
}
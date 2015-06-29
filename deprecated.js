//En desuso
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
function filtro_general(frase,claves,cb){
	//claves es un array que contiene en cada posicion un array de claves
	//cb es un array de callbacks
	var i = 0;
	var j = 0;
	var encontrado = false;
	var encontrados = new Array(claves.length);
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
					if(validar_clave(frase[i],claves[j][w])){
						//Hacemos que se encargue el callback
						//Nosotros ya hemos encontrado la posicion y no volveremos a buscar para ese filtro
						//Estos parametros son:
						//i=pos palabra,j=pos diccionario,w = pos clave
						cb(i,j,w);
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
		if(vector(i) === false){
			devolver = false;
		}
		i++;
	}
	return devolver;
}
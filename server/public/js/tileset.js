/**
* @brief : Classe qui gere le niveau
**/


function TileSet (viewport, cell_size)
{
	//////////////////////////////////////////////////////////////////////////////////
	// Attributs
	//////////////////////////////////////////////////////////////////////////////////
	var m_viewport;
	var m_spriteList;
	var m_currentLevel;
	var m_tile_map;
	
	//////////////////////////////////////////////////////////////////////////////////
	// M�thodes
	/////////////////////////////////////////////////////////////////////////////////
	
	/**
	* @brief : Constructeur de la classe Tileset
	**/
	this.constructor  = function ()
	{
		m_viewport = viewport ;
		m_currentLevel = 1 ;		
		m_tile_map = new jaws.TileMap({size : [m_viewport.max_x/cell_size,m_viewport.max_y/cell_size] , cell_size: [cell_size,cell_size]});
		
		m_spriteList = new jaws.SpriteList();

		this.loadLevel();
	
	}
	
	/**
	*@brief : Dessine le level
	**/
	this.draw = function()
	{
		m_spriteList.draw();
	
	}

	/**
	*@brief : Accesseur de spriteList
	**/
	this.getSpriteList = function()
	{
		return m_spriteList;
	
	}	
	
	/**
	* @brief : Accesseur de m_tile_map
	* @note : Obsol�te
	**/
	this.getTileMap = function ()
	{
		return m_tile_map;
	}

		
	/**
	* @brief : Accesseur pour la lecture du niveau , attribut m_currentLevel
	**/
	this.getcurrentLevel = function ()
	{
		return  m_currentLevel;
	}
	
	/**
	* @brief : Accesseur pour la lecture du niveau , attribut m_currentLevel
	**/
	this.setcurrentLevel = function ( value)
	{
		 m_currentLevel = value;
	}
	
	/**
	* @brief : Accesseur pour la lecture du niveau , attribut m_currentLevel
	**/
	this.incrementcurrentLevel = function ()
	{
		 m_currentLevel++;
	}

		
	/**
	*@brief : traitement lors du chargement du niveau
	*@note : peut etre des parametres a rajout�es pour la taille et le cell_size
	**/
	this.loadLevel = function  ()
	{
	    m_spriteList = new jaws.SpriteList();	

		m_spriteList.load(jaws.assets.get(this.getLevelName())); 
		 
		m_tile_map = new jaws.TileMap({size : [m_viewport.max_x/cell_size+10,m_viewport.max_y/cell_size+10] ,cell_size: [cell_size,cell_size]});
		m_tile_map.push(m_spriteList);	
	}


	//@see levelModel.js la meme fonction mais cot� serveur
	this.getLevelName = function()
	{
		//var global dans le html
		if(trackID == "id56")
		{
			return 'tracks/default.json';
		}
		else if (trackID == "id68")
		{
			return 'tracks/track1.json';
		}
		else if (trackID == "id24")
		{
			return 'tracks/track2.json';
		}
		else if (trackID == "id32")
		{
			return  'tracks/default.json';
		}
		else
		{
			return 'tracks/default.json';
		}
	}
//end of class	
}

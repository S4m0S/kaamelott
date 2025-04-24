const { Container, Row, Col, Card, Form, Button, Pagination, Spinner, Alert } = ReactBootstrap;
const {
    useState,
    useReducer,
    useEffect
//   Au besoin, ajouter ici d'autres éléments React
} = React




// Composant Principal React : APP
function KaamelottApp() {
 
  const [citations, setCitations] = React.useState([]);
  const [personnage, setPersonnage] = React.useState(new Set());
  const [saison, setSaison] = React.useState(new Set());
  const [auteur, setAuteur] = React.useState(new Set());
  const [pageActuelle, setPageActuelle] = React.useState(0);
  const [error, setError] = React.useState(null);


  
   useEffect(() => {
    async function initialize() {
        try{
            const resultat = await initObjects();
            setPersonnage(resultat.setPersonnage);
            setSaison(resultat.setSaison);
            setAuteur(resultat.setAuteur);
            setCitations(resultat.listeCitations);
        }
        catch (error){
            setError("Impossible de se connecter à l'API, utilisez cette extension Chrome pour pouvoir y accéder : ")
        }
    }
    
        initialize();
    
    
  }, [])

  
// Return toute l'application : Titre, Search Bar, vue des citations
  return (
    <Container fluid>
        <Row>
            <Col>
                <h1>
                    Kaamelott App
                </h1>
            </Col>
        </Row>
        {
            error ? ( <Alert>
                {
                <div>
                    {error}
                    <a style={{color: "red"}} href="https://chromewebstore.google.com/detail/lhobafahddgcelffkeicbaginigeejlf?utm_source=item-share-cb">https://chromewebstore.google.com/detail/lhobafahddgcelffkeicbaginigeejlf?utm_source=item-share-cb</a>
                </div>
                }
            </Alert>
        ) : (
            <div>
                <ShowSearchBar personnages={[...personnage]} saisons={[...saison]} auteurs={[...auteur]} setCitations={setCitations} setPageActuelle={setPageActuelle} />
                <ShowCitations citations={citations} pageActuelle={pageActuelle} setPageActuelle={setPageActuelle} />
            </div>
        )
        }
        
    </Container>
  );
}




// Composant Fonctionnel React : affiche la bar de recherche utilisateur avec les options a selectionnez
function ShowSearchBar({personnages, saisons, auteurs, setCitations, setPageActuelle}){

    const [personnageSelectionner, setPersonnageSelectionner] = React.useState("");
    const [saisonSelectionner, setSaisonSelectionner] = React.useState("");
    const [auteurSelectionner, setAuteurSelectionner] = React.useState("");

    const [personnageDisable, setPersonnageDisable] = React.useState(false);
    const [saisonDisable, setSaisonDisable] = React.useState(false);
    const [auteurDisable, setAuteurDisable] = React.useState(false);

    useEffect(() => {

        if (auteurSelectionner !== "") {
            setPersonnageDisable(true);
            setSaisonDisable(true);
        } else {
            setPersonnageDisable(false);
            setSaisonDisable(false);
        }

        if (personnageSelectionner !== "" || saisonSelectionner !== "") {
            setAuteurDisable(true);
        } else {   
            setAuteurDisable(false);
        }
    }, [personnageSelectionner, saisonSelectionner, auteurSelectionner]);

    return(
        <div>
            <Row> 
            <Col>
                <label htmlFor="personnage">Choisisez un personnage : </label> 
                <select name="personnage" 
                 id="personnage" 
                 onChange={(e) => setPersonnageSelectionner(e.target.value)}
                 disabled={personnageDisable}
                >

                <option value="">-- Selectionnez un personnage --</option>
                {
                    personnages.map((personnage) => (
                        <option value={personnage} key={personnage}>{personnage}</option>
                    ))
                }
                </select>
            </Col>
            <Col> 
                <label htmlFor="saison">Choisisez un saison : </label> 
                <select name="saison" id="saison"
                 onChange={(e) => setSaisonSelectionner(e.target.value)} 
                 disabled={saisonDisable}
                >
                <option value="">-- Selectionnez un saison --</option>
                {
                    saisons.map((saison) => (
                        <option value={saison} key={saison}>{saison}</option>
                    ))
                }
                </select>
            </Col>
            <Col> 
                <label htmlFor="auteur">Choisisez un auteur : </label> 
                <select name="auteur" id="auteur" onChange={(e) => setAuteurSelectionner(e.target.value)} disabled={auteurDisable}>
                <option value="">-- Selectionnez un auteur --</option>
                {
                    auteurs.map((auteur) => (
                        <option value={auteur} key={auteur}>{auteur}</option>
                    ))
                }
                </select>
            </Col>
            </Row>
            <Row style={{textAlign:"center"}}>
                <Col>
                    <BoutonGetCitations type={"all"} setCitations={setCitations} personnages={personnageSelectionner} saisons={saisonSelectionner} auteurs={auteurSelectionner} setPageActuelle={setPageActuelle}/>
                </Col>
                <Col>
                    <BoutonGetCitations type={"random"} setCitations={setCitations} personnages={personnageSelectionner} saisons={saisonSelectionner} auteurs={auteurSelectionner} setPageActuelle={setPageActuelle}/>
                </Col>
            </Row>
        </div>      
    )
}




// Fonction pour trouver la bonne URL à requeter en fonction des variables d'entrées de l'utilisateur
function setUrlWrite({personnages, saisons, auteurs}){
    let url = "";
    let params = [];

    if (saisons !== "") {
        let livre = null;
        switch (saisons) {
            case "Livre I": 
                livre = 1; 
                break;
            case "Livre II": 
                livre = 2; 
                break;
            case "Livre III": 
                livre = 3; 
                break;
            case "Livre IV": 
                livre = 4;
                break;
            case "Livre V": 
                livre = 5; 
                break;
            case "Livre VI": 
                livre = 6;
                break;
            default: 
                livre = null;
                break;
        }   
        if(livre !== null){
            params.push(`livre/${livre}`);
        }
    }

    if (personnages !== "") {
        params.push(`personnage/${encodeURIComponent(personnages)}`);
    }
    
    if (auteurs !== "") {
        params.push(`auteur/${encodeURIComponent(auteurs)}`);
    }

    if (params.length > 0) {
        url = "/" + params.join("/");
    }

    return url;
}




// Composant Fonctionnel React pour ajouter les boutons de requetage a l API ("all" et "random")
function BoutonGetCitations({type, setCitations, personnages, saisons, auteurs, setPageActuelle}){
    const [loading, setLoading] = React.useState(false);

    async function click() {
        setLoading(true);
        try {
            const urlParams = setUrlWrite({personnages, saisons, auteurs});
            
            const urlExtension = urlParams ? `/${type}${urlParams}` : `/${type}`;
            
            const data = await askApi({ urlExtension });

            setPageActuelle(0);

            if (Array.isArray(data.citation)) {
                setCitations(data.citation);
            } else {
                setCitations([data.citation]);
            }
            
           
           

        } catch (error) {
            console.error("Erreur pendant le chargement : ", error);
        } finally {
            setLoading(false); 
        }
    }

    return(
        <div>
            <button onClick={click}>{loading ? <Spinner animation="border" size="sm" /> : type === "all" ? "Toutes les citations" : "Citation aléatoire"}</button>
        </div>
    )
}




// Composant Fonctionnel React pour afficher les citations
function ShowCitations({citations, pageActuelle, setPageActuelle}){
    const [audioFiles, setAudioFiles] = React.useState({});

    useEffect(() => {
        // Load audio files for all citations on the current page
        const loadAudioFiles = async () => {
            const newAudioFiles = {};
            for (const citation of chunkedCitations[pageActuelle]) {
                const audioFile = await mapping(citation.citation);
                newAudioFiles[citation.citation] = audioFile;
            }
            setAudioFiles(newAudioFiles);
        };
        loadAudioFiles();
    }, [citations, pageActuelle]);

    const chunkedCitations = citations.length===1 ? [citations] : chunkArray(citations,10);
    
    function nextPage() {
        if (pageActuelle < chunkedCitations.length - 1) {
            setPageActuelle(pageActuelle + 1);
        }
    }
  
    function previousPage() {
        if (pageActuelle > 0) {
            setPageActuelle(pageActuelle - 1);
        }
    }

    if (!citations || citations.length === 0) {
        return <div>Aucune citation à afficher</div>;
    }

    return (
        <Container fluid style={{textAlign: "center"}}>


            <Row><Col xs = {5}>Citations</Col> <Col xs = {3}>Personnage et Photo</Col> <Col xs={2}>Audio</Col> </Row>

            {chunkedCitations.length > 0 && chunkedCitations[pageActuelle].map((citation, index) => (
                <Row key={index}>
                    <Col xs={5}>{citation.citation}</Col>
                    -
                    <Col>
                    <ImageImpport 
                    src={`https://kaamelott.chaudie.re/api/personnage/${citation.infos.personnage}/pic`}
                    alt={`Photo de ${citation.infos.personnage}\n interpretez par ${citation.infos.acteur}`} 
                    personnage={citation.infos.personnage}
                    />
                    </Col>
                    - 
                    <Col>
                    {
                        audioFiles[citation.citation] ? (
                            <audio controls>
                            <source src={`https://kaamelott.chaudie.re/api/sounds/${audioFiles[citation.citation]}`} type="audio/mp3" />
                            </audio>
                        ) : (
                            <Spinner animation="border" size="sm" />
                        )
                    }
                    </Col>
                </Row>
            ))}
            { chunkedCitations.length > 1 && (
                <div>
                    
                    <button onClick={previousPage}>Page Précedente</button>
                    <button onClick={nextPage}>Page Suivante</button>
                </div>
            )}
        </Container>
    )
}





async function loadMatchData() {
    let matchDataCache = null;
    try {
        const response = await fetch('match.json');
        matchDataCache = await response.json();
    } catch (error) {
        console.error('Error loading match.json:', error);
        matchDataCache = [];
    }

    return matchDataCache;
}

async function mapping(citation) {
   
    return loadMatchData().then(data => {
        
        const normalizedCitation = citation.toLowerCase()
            .replace(/\s+/g, ' ')
            .trim();
        
        
        let match = data.find(item => 
            item.quote_associated.toLowerCase() === normalizedCitation
            
        );
        console.log(match)
        return match ? match.audio_file : 'cest_facile_on_peut_jouer_soit_avec_des_haricots_soit_avec_des_lentilles.mp3'; // Au cas où on ne trouve rien
    });
}


// Fonction pour rendre la liste plus petite, necessaire à la pagination
function chunkArray(array, chunkSize) {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      const chunk = array.slice(i, i + chunkSize);
      result.push(chunk);
    }
    return result;
}



// Initialisation des object en requetant l'api (personnage, auteur, saison)
async function initObjects(){

    // On requete l api pour avoir toutes les citations -> tous les personnages, auteurs et saisons
    const response = await askApi({urlExtension: "/all"});
    const setPersonnage = new Set() ;
    const setAuteur = new Set();
    const setSaison = new Set();
    const listeCitations = [];


    // Pour chacune des citations obtenue
    response.citation.forEach((citation) => {
        setPersonnage.add(citation.infos.personnage);
        setAuteur.add(citation.infos.auteur);
        setSaison.add(citation.infos.saison);
        listeCitations.push(citation)
    })

    
   
    return {setPersonnage,setAuteur,setSaison, listeCitations};

}




// Composant Fonctionnels : Sert à éviter l icone moche lorsqu une image n existe pas
function ImageImpport({ src, alt, personnage }) {
    const [imgError, setImgError] = React.useState(false);
  
    function handleError() {
      setTimeout(() => {
        setImgError(true);
      }, 200); // Attend 200ms avant de dire que c'est une erreur
    }
  
    if (imgError) {
      return <div style={{ fontStyle: 'italic', color: '#6c757d' }}>{alt}</div>;
    }
  
    return (
      <div>
        <img 
          src={src} 
          alt={alt} 
          onError={handleError} 
          style={{ maxWidth: "100px", borderRadius: "10px" }}
        />
        <br/>
        <p>{personnage}</p>
      </div>
    );
  }
  
  


// Fonction async pour fetch l'API
async function askApi({urlExtension}){

    try{
        
        const urlToFetch = "https://kaamelott.chaudie.re/api" + urlExtension;
        console.log(urlToFetch);
        const response = await fetch(urlToFetch, {
            method: "GET"
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const data = await response.json();
        return data;
    }
    catch (error){
        console.error("Erreur lorsque on souhaite acceder à l'api : ", error);
        throw error;
    }
}

// Rendu de l'application
ReactDOM.render(<KaamelottApp />, document.getElementById('root'));
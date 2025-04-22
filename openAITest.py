from openai import OpenAI
import json
import os
client = OpenAI(api_key="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")



def main(quotes_path, sound_dir):

    message = []

    message.append({"role":"user", "content":"""
You will receive a list of quotes from the French series Kaamelott. Following the quotes, I will provide a single .mp3 filename. Your task is to identify which quote corresponds to the filename based on a direct, unique association (e.g., the filename contains a number or keyword explicitly tied to one quote). Each quote is linked to only one filename.

Steps:

I will first provide the list of quotes.

Then, I will give the .mp3 filename.

You will output only the exact matching quote (without quotation marks or additional text).

Ensure your response is solely the quote itself, nothing else.
"""})

    # Recuperation des citations
    with open(quotes_path, "r", encoding="utf-8") as f:
        quotes_data = json.load(f)
    
    quotes = "---".join(item["quote"] for item in quotes_data)


    # Recuperations des fichiers audios
    audio_files = [f for f in os.listdir(sound_dir) if f.endswith('.mp3')]


    mapping = []


    response = client.responses.create(
        model = "gpt-4.1-nano",
        input = message
    )

    message.append({"role":"assistant","content":response.output_text})


    message.append({
        "role" : "user",
        "content": 'Here are the quotes, they are separated by "---" : '+ quotes + " Some of them are allready associated with audios : "+ json.dumps([
            {'audio_file': '2_3_poils_de_Q.mp3', 'quote_associated': "Vous n'avez qu'à considérer que je suis officiellement cul nu."},
            {'audio_file': 'ah_ah_mais_vous_etes_marteau_et_regardez_ca_ca_pisse_le_sang.mp3', 'quote_associated': 'Ah ah, mais vous êtes marteau ! Et regardez ça, ça pisse le sang !'},
            {'audio_file': 'ah_bah_alors_la_je_les_attends_les_mecs.mp3', 'quote_associated': 'Ah bah alors là je les attends les mecs !'},
            {'audio_file': 'ah_bravo_bah_vous_parlez_d_un_hero.mp3', 'quote_associated': 'Ah bravo, bah vous parlez d\'un héros !'},
            {'audio_file': 'ah_cest_ca.mp3', 'quote_associated': "Ah mais c'est ça qui pue !"},
            {'audio_file': 'ah_le_printemps_on_crame_des_mecs.mp3', 'quote_associated': 'Ah, le printemps ! La nature se réveille, les oiseaux reviennent, on crame des mecs.'},
            {'audio_file': 'ah_mais_arretez_de_gueuler_comme_un_con.mp3', 'quote_associated': 'Ah mais arrêtez de gueuler comme un con !'},
            {'audio_file': 'arretez_de_parler_aux_gens.mp3', 'quote_associated': "Non, moi j'crois qu'il faut qu'vous arrêtiez d'essayer d'dire des trucs. Ça vous fatigue, déjà, et pour les autres, vous vous rendez pas compte de c'que c'est. Moi quand vous faites ça, ça me fout une angoisse… j'pourrais vous tuer, j'crois. De chagrin, hein ! J'vous jure c'est pas bien. Il faut plus que vous parliez avec des gens."}
        ])
    })

    

    response = client.responses.create(
        model = "gpt-4.1-nano",
        input = message
    )

    message.append({"role":"assistant","content":response.output_text})

    for (index,audio_file) in enumerate(audio_files):

        message.append({
                            "role" :"user",
                            "content": "Audio filename : "+audio_file
                        })
        response = client.responses.create(
            model = "o4-mini",
            input = message
        )

        mapping.append({"audio_file":audio_file,"quote_associated":response.output_text})


        message.append({"role":"assistant","content":response.output_text})
        print(mapping[index])
        

    
    print(mapping)
    json_file_output = json.dumps(mapping, indent=2)
    with open("output.json", "w") as outfile:
        outfile.write(json_file_output)
        



print(main("quotes.json","sounds"))

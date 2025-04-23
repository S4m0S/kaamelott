from openai import OpenAI
import json
import os
client = OpenAI(api_key="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")



def main(quotes_path, sound_dir):

    message = []

    message.append({"role":"user", "content":"""
You will receive a list of audio files name from the French series Kaamelott. Following the files name, I will provide a single quote. Your task is to identify which audio file corresponds to the quote based on a direct, unique association (e.g., the filename contains a number or keyword explicitly tied to one quote). Each filename is linked to only one quote.

Steps:

I will first provide the list of .mp3 filename.

Then, I will give the quote.

You will output only the exact matching .mp3 filename (without quotation marks or additional text).

Ensure your response is solely the filename itself, nothing else.
Once you have no audio left to assign answer "STOP"
"""})

    # Recuperation des citations
    with open(quotes_path, "r", encoding="utf-8") as f:
        quotes_data = json.load(f)

    
    quotes =[item["quote"] for item in quotes_data]


    # Recuperations des fichiers audios
    audio_files = " --- ".join([f for f in os.listdir(sound_dir) if f.endswith('.mp3')])


    mapping = []


    response = client.responses.create(
        model = "o4-mini",
        input = message
    )

    message.append({"role":"assistant","content":response.output_text})


    message.append({
        "role" : "user",
        "content": 'Here are the .mp3 files, they are separated by " --- " : '+ audio_files 
    })

    

    response = client.responses.create(
        model = "o4-mini",
        input = message
    )

    message.append({"role":"assistant","content":response.output_text})

    for (index,quote) in enumerate(quotes):

        message.append({
                            "role" :"user",
                            "content": "Quote : "+quote
                        })
        response = client.responses.create(
            model = "o4-mini",
            input = message
        )

        mapping.append({"quote":quote,"audio_file":response.output_text})


        message.append({"role":"assistant","content":response.output_text})
        print(mapping[index])
        

    
    print(mapping)
    json_file_output = json.dumps(mapping, indent=2)
    with open("output.json", "w") as outfile:
        outfile.write(json_file_output)
        



print(main("quotes.json","sounds"))

import mysql.connector
import datetime

VOTO_MEDIO_NAME = "vote_average" 
VOTO_COUNT_NAME = "vote_count"

#Le Query sono state definite qui come "Costanti" (anche se in python non esistono propriamente vengono definite solitamente tutte in maiuscolo)
#per aumentarne la leggibilità nel codice e facilitarne eventuali futuri cambiamenti

#Ho utilizzato questo metodo di formattazione perchè utilizzando il formato f"" la valutazione viene svolta solo ad inizio codice
#e cosi facendo anche cambiando le variabili qui sopra la query non viene aggiornata
#Mentre usando la formattazione con "".format() la valutazione viene fatta prima di eseguire ogni query cosi evitando
#errori nel momento in cui si cambiano i nomi delle colonne 
 
QUERY_COUNT_FILM = "SELECT COUNT(movie_id) FROM movie;"
QUERY_FILM_VOTE_SIX = "SELECT title,{} FROM `movie` WHERE {} = 6;"#Gli spazzi rappresentano VOTO_MEDIO_NAME e VOTO_MEDIO_NAME
QUERY_FILM_BETWEEN_FIVE_SIX = "SELECT title,{} FROM `movie` WHERE {} BETWEEN 5 AND 6;"#Gli spazzi rappresentano VOTO_MEDIO_NAME e VOTO_MEDIO_NAME
QUERY_FILM_INSUFFICIENT = "SELECT title,{} FROM `movie` WHERE {} < 6;"#Gli spazzi rappresentano VOTO_MEDIO_NAME e VOTO_MEDIO_NAME
QUERY_FILM_TITLES_ORDERED = "SELECT title FROM `movie` ORDER BY {};"#Lo spazzio rappresenta VOTO_COUNT_NAME
QUERY_STAR_WARS_INFO = "SELECT * FROM `movie` WHERE title = 'Star Wars';"
QUERY_FILM_HIGHEST_VOTE = "SELECT title FROM `movie` ORDER BY {} DESC LIMIT 1;"#Lo spazzio rappresenta VOTO_MEDIO_NAME
QUERY_FILM_LOWEST_VOTE = "SELECT title FROM `movie` ORDER BY {} ASC LIMIT 1;"#Lo spazzio rappresenta VOTO_MEDIO_NAME
QUERY_FILM_HIGHEST_BUDGET = "SELECT title,overview FROM `movie` ORDER BY budget DESC LIMIT 1;"
STAR_WARS_FILMS = [
    (459499,"Star Wars: Episodio I - La minaccia fantasma", 115000000, "", "The evil Trade Federation, led by Nute Gunray is planning to take over the peaceful world of Naboo. Jedi Knights Qui-Gon Jinn and Obi-Wan Kenobi are sent to confront the leaders. But not everything goes to plan. The two Jedi escape, and along with their new Gungan friend, Jar Jar Binks head to Naboo to warn Queen Amidala, but droids have already started to capture Naboo and the Queen is not safe there. Eventually, they land on Tatooine, where they become friends with a young boy known as Anakin Skywalker. Qui-Gon is curious about the boy, and sees a bright future for him. The group must now find a way of getting to Coruscant and to finally solve this trade dispute, but there is someone else hiding in the shadows. Are the Sith really extinct? Is the Queen really who she says she is? And what's so special about this young boy?", 214, "1999-05-16", 924305084,136,"released", "At last we will reveal ourselves to the Jedi", 6.5, 817770),
    (459489,"Star Wars: Episodio II - L'attacco dei cloni", 120000000, "", "Ten years after the invasion of Naboo, the Galactic Republic is facing a Separatist movement and the former queen and now Senator Padmé Amidala travels to Coruscant to vote on a project to create an army to help the Jedi to protect the Republic. Upon arrival, she escapes from an attempt to kill her, and Obi-Wan Kenobi and his Padawan Anakin Skywalker are assigned to protect her. They chase the shape-shifter Zam Wessell but she is killed by a poisoned dart before revealing who hired her. The Jedi Council assigns Obi-Wan Kenobi to discover who has tried to kill Amidala and Anakin to protect her in Naboo. Obi-Wan discovers that the dart is from the planet Kamino, and he heads to the remote planet. He finds an army of clones that has been under production for years for the Republic and that the bounty hunter Jango Fett was the matrix for the clones. Meanwhile Anakin and Amidala fall in love with each other, and he has nightmarish visions of his mother. They travel to his home planet, Tatooine, to see his mother, and he discovers that she has been abducted by Tusken Raiders. Anakin finds his mother dying, and he kills all the Tusken tribe, including the women and children. Obi-Wan follows Jango Fett to the planet Geonosis where he discovers who is behind the Separatist movement. He transmits his discoveries to Anakin since he cannot reach the Jedi Council. Who is the leader of the Separatist movement? Will Anakin receive Obi-Wan's message? And will the secret love between Anakin and Amidala succeed?", 952, "2002-05-12", 649398328 ,142,"released", "A Jedi Shall Not Know Anger. Nor Hatred. Nor Love", 6.6, 723044),
    (459490,"Star Wars: Episodio III - La vendetta dei Sith", 113000000, "", "Nearly three years have passed since the beginning of the Clone Wars. The Republic, with the help of the Jedi, take on Count Dooku and the Separatists. With a new threat rising, the Jedi Council sends Obi-Wan Kenobi and Anakin Skywalker to aid the captured Chancellor. Anakin feels he is ready to be promoted to Jedi Master. Obi-Wan is hunting down the Separatist General, Grievous. When Anakin has future visions of pain and suffering coming Padmé's way, he sees Master Yoda for counsel. When Darth Sidious executes Order 66, it destroys most of all the Jedi have built. Experience the birth of Darth Vader. Feel the betrayal that leads to hatred between two brothers. And witness the power of hope.", 923, "2005-05-18", 380270577,140,"released", "The saga is complete.", 7.6, 804497),
    (459491,"Solo: A Star Wars Story", 275000000, "", "With the emerging demand of hyperfuel and other resources, Han Solo finds himself in the middle of a heist alongside other criminals, where they meet the likes of Chewbacca and Lando Calrissian in an adventurous situation exposing the criminal underworld.", 899, "2018-05-10", 392924807 ,135,"released", "Never tell him the odds.", 6.9, 356339),
    (459492,"Rogue One: A Star Wars Story", 200000000, "", "All looks lost for the Rebellion against the Empire as they learn of the existence of a new super weapon, the Death Star. Once a possible weakness in its construction is uncovered, the Rebel Alliance must set out on a desperate mission to steal the plans for the Death Star. The future of the entire galaxy now rests upon its success.", 346, "2016-12-10", 1058682142 ,133 ,"released", "A rebellion built on hope.", 7.8, 651519),
    (459493,"Star Wars: Episodio IV - Una nuova speranza", 11000000, "", "The Imperial Forces, under orders from cruel Darth Vader, hold Princess Leia hostage in their efforts to quell the rebellion against the Galactic Empire. Luke Skywalker and Han Solo, captain of the Millennium Falcon, work together with the companionable droid duo R2-D2 and C-3PO to rescue the beautiful princess, help the Rebel Alliance and restore freedom and justice to the Galaxy", 244, "1977-05-25", 797900000,121,"released", "It's Back! The Force will be with you for three weeks only.", 8.6, 1382286),
    (459494,"Star Wars: Episodio V - L'Impero colpisce ancora ", 25000000, "", "Luke Skywalker, Han Solo, Princess Leia and Chewbacca face attack by the Imperial forces and its AT-AT walkers on the ice planet Hoth. While Han and Leia escape in the Millennium Falcon, Luke travels to Dagobah in search of Yoda. Only with the Jedi Master's help will Luke survive when the Dark Side of the Force beckons him into the ultimate duel with Darth Vader.", 717, "1980-05-17",  538375067,124,"released", "The Adventure Continues...", 8.7, 1309954),
    (459495,"Star Wars: Episodio VI - Il ritorno dello Jedi ", 32500000, "", "Luke Skywalker battles Jabba the Hutt and Darth Vader to save his comrades in the Rebel Alliance and triumph over the Galactic Empire. Han Solo and Princess Leia reaffirm their love, and team with Chewbacca, Lando Calrissian, the Ewoks, and droids C-3PO and R2-D2 to aid in the disruption of the Dark Side, and the defeat of the evil emperor.", 553, "1983-05-23" , 572705079,131,"released", "Coming May 25, 1983 to your galaxy.", 8.3, 1068265),
    (459496,"Star Wars: Episodio VII - Il risveglio della Forza", 245000000, "", "30 years after the defeat of Darth Vader and the Empire, Rey, a scavenger from the planet Jakku, finds a BB-8 droid that knows the whereabouts of the long lost Luke Skywalker. Rey, as well as a rogue stormtrooper and two smugglers, are thrown into the middle of a battle between the Resistance and the daunting legions of the First Order.", 650, "2015-12-14", 2069521700,135,"released", "Every generation has a story", 7.8, 941570),
    (459497,"Star Wars: Episodio VIII - Gli ultimi Jedi", 200000000, "", "Jedi Master-in-hiding Luke Skywalker unwillingly attempts to guide young hopeful Rey in the ways of the force, while Leia, former princess turned general, attempts to lead what is left of the Resistance away from the ruthless tyrannical grip of the First Order.", 764, "2017,10,09", 1332698830,152,"released", "Let the Past Die", 6.9, 642413),
    (459498,"Star Wars: Episodio IX - L'ascesa di Skywalker", 275000000, "", "While the First Order continues to ravage the galaxy, Rey finalizes her training as a Jedi. But danger suddenly rises from the ashes as the evil Emperor Palpatine mysteriously returns from the dead. While working with Finn and Poe Dameron to fulfill a new mission, Rey will not only face Kylo Ren once more, but she will also finally discover the truth about her parents as well as a deadly secret that could determine her future and the fate of the ultimate final showdown that is to come.", 340, "2019-10-16", 1074149279,142,"released", "Every Generation Has A Legend.", 6.5, 461875)
]
QUERY_INSERTS_STAR_WARS_FILMS = "INSERT INTO `movie` VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
QUERY_DELETE_TITANIC = "DELETE FROM movie WHERE title = 'titanic';"
QUERY_CHANGE_VOTO_NAME = "ALTER TABLE movie CHANGE COLUMN vote_average votomedio decimal(4,2);"
QUERY_CHANGE_VOTES_COUNT_NAME = "ALTER TABLE movie CHANGE COLUMN vote_count numerovoti int(11);"
QUERY_ADD_NOTE_FILM = "ALTER TABLE movie ADD notefilm varchar(1000);"

connection = None

def createConnection(host_name = "localhost" , user_name = "root", db_name = "movies"):
    global connection
    try:
        connection = mysql.connector.connect(
            host=host_name,
            user=user_name,
            database=db_name)
    except mysql.connector.Error as err:
        print(f"L'errore {err} si e' verificato durante la connesione al db")

def QueryOne():
    try:
        mycursor = connection.cursor()
        mycursor.execute(QUERY_COUNT_FILM)
        myresult = mycursor.fetchall()
        print(f"Sono presenti un totale di {myresult[0][0]} righe")
    except mysql.connector.Error as err:
        print(f"Il problema {err} e' insorto")

def QueryTwo():
    try:
        mycursor = connection.cursor()
        mycursor.execute(QUERY_FILM_VOTE_SIX.format(VOTO_MEDIO_NAME,VOTO_MEDIO_NAME))
        myresult = mycursor.fetchall()
        print("Ecco la lista di film il cui voto e' 6:\n")
        for tupleRow in myresult:
            print(tupleRow[0],"voto:",tupleRow[1])
            print("------------------")
    except mysql.connector.Error as err:
        print(f"Il problema {err} e' insorto")

def QueryThree():
    try:
        mycursor = connection.cursor()
        mycursor.execute(QUERY_FILM_BETWEEN_FIVE_SIX.format(VOTO_MEDIO_NAME,VOTO_MEDIO_NAME))
        myresult = mycursor.fetchall()
        print("Ecco la lista di film il cui voto e' compreso tra il 5 e il 6:\n")
        for tupleRow in myresult:
            print(tupleRow[0],"voto:",tupleRow[1])
            print("------------------")
    except mysql.connector.Error as err:
        print(f"Il problema {err} e' insorto")

def QueryFour():
    try:
        mycursor = connection.cursor()
        mycursor.execute(QUERY_FILM_INSUFFICIENT.format(VOTO_MEDIO_NAME,VOTO_MEDIO_NAME))
        myresult = mycursor.fetchall()
        print("Ecco la lista di film il cui voto e' insufficiente:\n")
        for tupleRow in myresult:
            print(tupleRow[0],"voto:",tupleRow[1])
            print("------------------")
    except mysql.connector.Error as err:
        print(f"Il problema {err} e' insorto")

def QueryFive():
    try:
        mycursor = connection.cursor()
        mycursor.execute(QUERY_FILM_TITLES_ORDERED.format(VOTO_COUNT_NAME))
        myresult = mycursor.fetchall()
        print("Ecco la lista di film ordinati in base al numero di voti:")
        for tupleRow in myresult:
            print(tupleRow[0])
            print("------------------")
    except mysql.connector.Error as err:
        print(f"Il problema {err} e' insorto")

def QuerySix():
    try:
        mycursor = connection.cursor()
        mycursor.execute(QUERY_STAR_WARS_INFO)
        myresult = mycursor.fetchall()
        print("Ecco le informazioni del film star wars:")
        colonneName = ["ID Film","Titolo","Budget","Homepage","Descrizione","Popolarita'","Data di rilascio","Guadagni","Durata","Stato del film","Tagline","Voto medio","Quantita' voti"]
        for id,colonna in enumerate(colonneName):
            print(colonna+":")
            print(myresult[0][id])
            print("-"*20)
    except mysql.connector.Error as err:
        print(f"Il problema {err} e' insorto")

def QuerySeven():
    try:
        mycursor = connection.cursor()
        mycursor.execute(QUERY_FILM_HIGHEST_VOTE.format(VOTO_MEDIO_NAME))
        myresult = mycursor.fetchall()
        print(f"{myresult[0][0]} e' stato il film con il voto piu' alto")
    except mysql.connector.Error as err:
        print(f"Il problema {err} e' insorto")

def QueryEight():
    try:
        mycursor = connection.cursor()
        mycursor.execute(QUERY_FILM_LOWEST_VOTE.format(VOTO_MEDIO_NAME))
        myresult = mycursor.fetchall()
        print(f"{myresult[0][0]} e' stato il film con il voto piu' basso")
    except mysql.connector.Error as err:
        print(f"Il problema {err} e' insorto")

def QueryNine():
    try:
        mycursor = connection.cursor()
        mycursor.execute(QUERY_FILM_HIGHEST_BUDGET)
        myresult = mycursor.fetchall()
        print(f"ecco il film con il budget piu' alto")
        print("-"*20)
        print("Titolo:")
        print(myresult[0][0])
        print("-"*20)
        print("Descrizione:")
        print(myresult[0][1])
    except mysql.connector.Error as err:
        print(f"Il problema {err} e' insorto")

def QueryTen():
    try:
        mycursor = connection.cursor()
        mycursor.executemany(QUERY_INSERTS_STAR_WARS_FILMS,STAR_WARS_FILMS)
        connection.commit()
        print("La serie di film Star Wars e' stata aggiornata aggiungendo tutti i titoli mancanti")
    except mysql.connector.Error as err:
        print("La serie di film Star Wars e' gia al completo")

def QueryEleven():
    mycursor = connection.cursor()
    try:
        mycursor.execute(QUERY_DELETE_TITANIC)
        connection.commit()
        print("Il film Titanic e' stato eliminato correttamente")
    except mysql.connector.Error as err:
        print("Il film Titanic non e' presente nel database")

def QueryTwelve():
    global VOTO_MEDIO_NAME
    mycursor = connection.cursor()
    try:
        VOTO_MEDIO_NAME = "votomedio"
        mycursor.execute(QUERY_CHANGE_VOTO_NAME)
        connection.commit()
        print("La colonna voto_average e' stata rinominata votomedio con successo")
    except mysql.connector.Error as err:
        print("La colonna voto_average e' gia' stata rinominata")

def QueryThirteen():
    global VOTO_COUNT_NAME
    mycursor = connection.cursor()
    try:
        VOTO_COUNT_NAME = "numerovoti"
        mycursor.execute(QUERY_CHANGE_VOTES_COUNT_NAME)
        connection.commit()
        print("La colonna vote_count e' stata rinominata numerovoti con successo")
    except mysql.connector.Error as err:
        print("La colonna vote_count e' gia' stata rinominata")

def QueryFourteen():
    mycursor = connection.cursor()
    try:
        mycursor.execute(QUERY_ADD_NOTE_FILM)
        connection.commit()
        print("La colonna notefilm e' stata aggiunta con successo")
    except mysql.connector.Error as err:
        print("La colonna notefilm e' gia' stata aggiunta in precedenza")

def printTestata():
    print("*"*50)
    print("* Autore : Tverdohleb Egor" + " "*(23) + "*")
    print("*"+48*" "+"*")
    print("*"+48*" "+"*")
    print(f"* classe : 5BI" + " "*(35)+"*")
    print("*"+48*" "+"*")
    print("*"+48*" "+"*")
    print(f"* Orario attuale : {datetime.datetime.now()}    *")
    print("*"+48*" "+"*")
    print("*"*50)

#Viene usata come alternativa per simulare il funzionamento dello switch in Python
MAP_QUERY = {
    1 : QueryOne,
    2 : QueryTwo,
    3 : QueryThree,
    4 : QueryFour,
    5 : QueryFive,
    6 : QuerySix,
    7 : QuerySeven,
    8 : QueryEight,
    9 : QueryNine,
    10 : QueryTen,
    11 : QueryEleven,
    12 : QueryTwelve,
    13 : QueryThirteen,
    14 : QueryFourteen,
}

def main():
    INCORSO = True
    createConnection()
    
    printTestata()

    while INCORSO:
        print(
            """
            Scegliere l'istruzione da eseguire e in seguito inserire il codice
            1 - Conta quanti film sono presenti nella tabella
            2 - Riportami i film con voto pari a 6
            3 - Riportami i film con voto tra il 5 e il 6
            4 - Riportami i film con voti insufficienti
            5 - Riportami i film ordinati in base al numero di voti
            6 - Riportami le informazioni del film Star Wars
            7 - Riportami il titolo del film con il voto piu' alto
            8 - Riportami il titolo del film con il voto piu' basso
            9 - Riportami il titolo e la descrizione del film con il budget piu' alto
            10 - Aggiorna il database aggiungendo i film di Star Wars mancanti
            11 - Cancella il record del film Titanic dal database
            12 - Rinomina la colonna vote_avarage in votomedio
            13 - Rinomina la colonna vote_count in numerovoti
            14 - Aggiungi il campo notefilm
            EXIT - Termina il programma
            """
        )
        codiceInput = input()
        if(codiceInput.upper() == "EXIT"):
            INCORSO = False
        elif(codiceInput.isnumeric() and 1<=int(codiceInput)<=14):
            MAP_QUERY[int(codiceInput)]()
            input("Premere invio per proseguire")
        else:
            print("Perfavore inserire un valore valido")

    connection.close()

if __name__ == "__main__":
    main()

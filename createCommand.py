
from os import path

def main():
    # Get the name of the new command and make sure it's valid
    commandName = input("Insert the name of the new command: ").lower()
    if len(commandName.strip()) <= 0:
        print("Please insert a valid name")
        return
    
    # Make sure the command doesn't already exist
    endPath = path.join("./commands", commandName.capitalize() + ".js")
    if path.isfile(endPath):
        print("Command already exists")
        return
    
    # Load in the template
    template = []
    with open("__commandTemplate__", "r") as file:
        template = file.readlines()

    # Replace template variables with the correct value
    for i in range(len(template)):
        template[i] = template[i].replace(
            "__COMMAND_CLASS_NAME__", commandName.capitalize()
        ).replace(
            "__COMMAND_NAME__", "\"" + commandName + "\""
        )

    # Save the newly created command
    with open(endPath, "w") as file:
            file.writelines(template)

if __name__ == "__main__":
    main()

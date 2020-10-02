# Frank Bot 2.0

## What version are python scripts made for and what libraries do they use?

 - The version of Python currently in use is "Python 3.8"
 - No external libraries are used except for the standard ones

## What do the python scripts do?

 - There are currently 2 main python scripts:
  1. `localeHelper.py` which is used to make translating to other locales easier, just follow the steps that it asks you
  2. `commands/createCommand.py` which is used to create a new command, it must be opened from the terminal with an argument which will be the name of the new command (NOTE: To make the new command automatically be recognized by the bot it should be moved to `commands/auto_require` and all required libraries paths should be changed to be relative to the new path, there's no need to change other files' contents, only the command file should be modified)

## Steps to run this project:

1. Create a file named `.env` and add all the following fields (NOTE: This project uses Postgres):
  - debug_log = false
  - token = "INSERT DISCORD TOKEN HERE"
  - db_host     = "DATABASE HOST"
  - db_port     = 5432
  - db_username = "DATABASE USERNAME"
  - db_password = "DATABASE PASSWORD"
  - db_name     = "DATABASE NAME"
2. Run `npm i` to install all dependencies
3. Run `node .` to run the project

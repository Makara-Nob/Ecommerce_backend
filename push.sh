#!/bin/bash

# Prompt for commit message
read -p "Enter commit message (or press enter for default): " msg

# Use default message if empty
if [ -z "$msg" ]; then
    msg="Auto-commit from push.sh"
fi

# Git commands
git add .
git commit -m "$msg"
git push origin main

# Pause at the end
read -p "Press enter to exit..."
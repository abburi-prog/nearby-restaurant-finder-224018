#!/bin/bash
cd /home/kavia/workspace/code-generation/nearby-restaurant-finder-224018/frontend_react
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi


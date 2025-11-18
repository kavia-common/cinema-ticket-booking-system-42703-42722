#!/bin/bash
cd /home/kavia/workspace/code-generation/cinema-ticket-booking-system-42703-42722/frontend_app
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi


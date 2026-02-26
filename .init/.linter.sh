#!/bin/bash
cd /home/kavia/workspace/code-generation/attendance-tracker-10377-10386/attendence_tracker_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi


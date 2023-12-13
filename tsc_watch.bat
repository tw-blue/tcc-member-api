@echo off
start /MIN copy_resources.bat watch

:: Copied from https://superuser.com/questions/1035043/how-can-i-tell-if-my-batch-file-is-running/1035423#1035423
:: Note - this extra call is to avoid a bug with %~f0 when the script
::        is executed with quotes around the script name.
call :getLock
exit /b

:getLock
:: The CALL will fail if another process already has a write lock on the script
call :main 9>>"%~f0"
exit /b

:main
start "Typescript Compiler" /MIN tsc -p . --watch
exit /b
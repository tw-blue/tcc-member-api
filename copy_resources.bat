@echo off
attrib /S /D +A .\tsc_src\*

if "%~1" == "watch" (goto loop) else (goto xcp)

:loop
call :xcp
timeout /t 5 /nobreak
goto loop

:xcp
xcopy /m /i /s /y /exclude:tscopy.txt .\\tsc_src .\\js_out
goto :EOF

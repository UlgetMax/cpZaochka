param (
    [string]$students
)

$wordApp = [Runtime.Interopservices.Marshal]::GetActiveObject("Word.Application")

if ($wordApp.Documents.Count -eq 0) {
    $doc = $wordApp.Documents.Add()
} else {
    $doc = $wordApp.ActiveDocument
}

$selection = $wordApp.Selection

# Декодируем JSON-строку обратно в массив
$studentsArray = $students | ConvertFrom-Json

foreach ($student in $studentsArray) {
    $selection.TypeText("$student`r`n")
}

param (
    [string]$text
)

# Подключаемся к запущенному экземпляру Word
$wordApp = [Runtime.Interopservices.Marshal]::GetActiveObject("Word.Application")

# Проверяем, есть ли открытые документы
if ($wordApp.Documents.Count -eq 0) {
    $doc = $wordApp.Documents.Add()
} else {
    $doc = $wordApp.ActiveDocument
}

# Вставляем текст в позицию текущего курсора
$selection = $wordApp.Selection
$selection.TypeText($text)

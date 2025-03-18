param (
    [string]$filePath
)

# Подключаемся к запущенному экземпляру Word
$wordApp = [Runtime.Interopservices.Marshal]::GetActiveObject("Word.Application")

# Проверяем, есть ли открытые документы
if ($wordApp.Documents.Count -eq 0) {
    $doc = $wordApp.Documents.Add()
} else {
    $doc = $wordApp.ActiveDocument
}

# Вставляем текст из документа
$selection = $wordApp.Selection
$selection.InsertFile($filePath)  # Вставка со всеми стилями из файла

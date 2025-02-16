import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } from "docx";
import { saveAs } from "file-saver";

export function generateDocx(course, semester, group, students) {
    const doc = new Document({
        sections: [
            {
                properties: {},
                children: [
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: "Частное учреждение образования «Колледж бизнеса и права»",
                                bold: true,
                                underline: {},
                                size: 28,
                                font: "Times New Roman",
                            }),
                        ],
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: "Брестский филиал",
                                bold: true,
                                underline: {},
                                size: 28,
                                font: "Times New Roman",
                            }),
                        ],
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: "ВЕДОМОСТЬ",
                                bold: true,
                                underline: {},
                                size: 32,
                                font: "Times New Roman",
                            }),
                        ],
                    }),
                    new Paragraph({
                        alignment: AlignmentType.LEFT,
                        children: [
                            new TextRun({
                                text: `Курс: ${course}  Семестр: ${semester}  Учебная группа: ${group}`,
                                size: 28,
                                font: "Times New Roman",
                            }),
                        ],
                    }),
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ children: [headerText("№ п/п")] }),
                                    new TableCell({ children: [headerText("Фамилия, имя, отчество")] }),
                                    new TableCell({ children: [headerText("Отметка о зачёте")] }),
                                    new TableCell({ children: [headerText("Вариант задания")] }),
                                    new TableCell({ children: [headerText("Отметка")] }),
                                    new TableCell({ children: [headerText("Подпись преподавателя")] }),
                                ],
                            }),
                            ...students.map((student, index) =>
                                new TableRow({
                                    children: [
                                        new TableCell({ children: [cellText(index + 1)] }),
                                        new TableCell({ children: [cellText(student.name)] }),
                                        new TableCell({ children: [cellText(student.pass ? "зачтено" : "незачёт")] }),
                                        new TableCell({ children: [cellText(student.variant)] }),
                                        new TableCell({ children: [cellText(student.mark)] }),
                                        new TableCell({ children: [cellText("")] }),
                                    ],
                                })
                            ),
                        ],
                    }),
                ],
            },
        ],
    });

    Packer.toBlob(doc).then((blob) => {
        saveAs(blob, "vedomost.docx");
    });
}

function headerText(text) {
    return new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
            new TextRun({
                text,
                bold: true,
                underline: {},
                size: 28,
                font: "Times New Roman",
            }),
        ],
    });
}

function cellText(text) {
    return new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
            new TextRun({
                text: text.toString(),
                size: 28,
                font: "Times New Roman",
            }),
        ],
    });
}

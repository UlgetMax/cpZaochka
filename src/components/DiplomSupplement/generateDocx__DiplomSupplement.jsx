import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, PageBreak } from "docx";
import { saveAs } from "file-saver";

export function generateDocx__DiplomSupplement(tables) {
    const doc = new Document({
        styles: {
            default: {
                document: {
                    run: {
                        font: "Times New Roman",
                        size: 24,
                    },
                },
            },
        },
        sections: [
            {
                properties: {},
                children: tables.flatMap((table, index) => [
                    // Добавляем разрыв страницы перед каждой таблицей, кроме первой
                    ...(index > 0 ? [new Paragraph({ children: [new PageBreak()] })] : []),

                    // Заголовок для каждой таблицы
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: "Частное учреждение образования",
                                bold: true,
                                underline: {},
                                size: 32,
                            }),
                        ],
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: "«Колледж бизнеса и права» Брестский филиал",
                                bold: true,
                                underline: {},
                                size: 32,
                            }),
                        ],
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: "(наименование учебного заведения)",
                                size: 24,
                            }),
                        ],
                    }),
                    new Paragraph({}),
                    new Paragraph({}),

                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: "В Е Д О М О С Т Ь",
                                bold: true,
                                size: 56,
                            }),
                        ],
                    }),

                    new Paragraph({}),

                    new Paragraph({
                        alignment: AlignmentType.LEFT,
                        children: [
                            new TextRun({
                                text: `отметок успеваемости учащихся группы № ${table.group}`,
                                size: 28,
                            }),
                            new TextRun({
                                text: `(для занесения в приложение к диплому)`,
                                size: 28,
                            }),
                        ],
                    }),

                    new Paragraph({}),

                    new Paragraph({
                        alignment: AlignmentType.LEFT,
                        children: [
                            new TextRun({
                                text: "Специальность ",
                            }),
                            new TextRun({
                                text: `      ${table.specialization}      `,
                                underline: {},
                            }),
                        ],
                    }),

                    new Paragraph({
                        alignment: AlignmentType.LEFT,
                        children: [
                            new TextRun({
                                text: "Наименование учебной дисциплины ",
                            }),
                            new TextRun({
                                text: `      ${table.predmet}      `,
                                underline: {},
                            }),
                        ],
                    }),
                    new Paragraph({
                        alignment: AlignmentType.LEFT,
                        children: [
                            new TextRun({
                                text: "Преподаватель ",
                            }),
                            new TextRun({
                                text: `      ${table.teacher}      `,
                                underline: {},
                            }),
                        ],
                    }),

                    new Paragraph({}),

                    // Таблица с данными
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ children: [headerText("№ п/п")] }),
                                    new TableCell({ children: [headerText("Ф. И. О. учащегося")] }),
                                    new TableCell({ children: [headerText("Отметка за каждый семестр")] }),
                                    new TableCell({ children: [headerText("Отметка к диплому")] }),
                                    new TableCell({ children: [headerText("Подпись преподавателя")] }),
                                ],
                            }),
                            ...table.students.map((student, index) =>
                                new TableRow({
                                    children: [
                                        new TableCell({ children: [cellText(index + 1)] }),
                                        new TableCell({ children: [cellText(student.full_name)] }),
                                        new TableCell({ children: [cellText(student.semestrGrades)] }), // Оценки за семестры
                                        new TableCell({ children: [cellText(student.diplomGrade)] }), // Отметка к диплому
                                        new TableCell({ children: [cellText("")] }), // Подпись преподавателя
                                    ],
                                })
                            ),
                        ],
                    }),
                ]),
            },
        ],
    });

    Packer.toBlob(doc).then((blob) => {
        saveAs(blob, "diplomSupplement.docx");
    });
}

function headerText(text) {
    return new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
            new TextRun({
                text,
                size: 24,
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
                size: 24,
                font: "Times New Roman",
            }),
        ],
    });
}
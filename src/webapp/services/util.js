import BoardEntry from "@/models/BoardEntry";
import Category from "@/models/Category";
import Board from "@/models/Board";

export function boardResponseToBoardModel( boardResponse ){
    let categories = [];
    
    for( let cResponseIndex in boardResponse.categories ){
        let categoriesResponse = boardResponse.categories[cResponseIndex];
        let boardEntriesTmp = [];
        for( let bEResponseIndex in categoriesResponse.boardEntries ){
            let boardEntriesResponse = categoriesResponse.boardEntries[bEResponseIndex];
            boardEntriesTmp.push(
                new BoardEntry( 
                    boardEntriesResponse.questions,
                    boardEntriesResponse.answer,
                    boardEntriesResponse.points,
                )
            );
        }
        categories.push(
            new Category(
                categoriesResponse.categoryName,
                categoriesResponse.categoryDescription,
                boardEntriesTmp,
            )
        );
    }

    return new Board( boardResponse._id, boardResponse.name, categories );
}
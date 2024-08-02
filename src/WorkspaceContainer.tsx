import CreateList from "./elements/list/CreateList";
import ListElement from "./elements/list/ListElement";
import { createListId, createListItemId, List, ListId, ListItem, ListItemId, WorkspaceId } from "./model";
import { ItemGroup } from "./tangible-gpt/model";
import { ActiveWorkspace } from "./RootPage";

type Props = {
    activeWorkspace: ActiveWorkspace;
    onUpdateLists: (workspaceId: WorkspaceId, lists: List[]) => void;
};

const WorkspaceContainer = ({activeWorkspace, onUpdateLists}: Props) => {
    const workspaceId = activeWorkspace.workspaceId;
    const lists = activeWorkspace.lists;

    const addItem = (listId: ListId, item: ListItem) => {
        const list = lists.find(l => l.id === listId);
        if (list !== undefined) {
            const updatedList: List = {
                id: list.id,
                name: list.name,
                items: list.items.concat(item)
            };
            const index = lists.indexOf(list);
            const updatedLists = [...lists];
            updatedLists[index] = updatedList;
            onUpdateLists(workspaceId, updatedLists);
        }
    };

    const onUpdateItems = (listId: ListId, items: ListItem[]) => {
        const list = lists.find(l => l.id === listId);
        if (list !== undefined) {
            const updatedList: List = {
                id: list.id,
                name: list.name,
                items: items
            };
            const index = lists.indexOf(list);
            const updatedLists = [...lists];
            updatedLists[index] = updatedList;
            onUpdateLists(workspaceId, updatedLists);
        }
    };

    const deleteItem = (listId: ListId, id: ListItemId) => {
        const list = lists.find(l => l.id === listId);
        if (list !== undefined) {
            const updatedList: List = {
                id: list.id,
                name: list.name,
                items: list.items.filter(i => i.id !== id)
            };
            const index = lists.indexOf(list);
            const updatedLists = [...lists];
            updatedLists[index] = updatedList;
            onUpdateLists(workspaceId, updatedLists);
        }
    };

    const editItem = (listId: ListId, item: ListItem) => {
        const list = lists.find(l => l.id === listId);
        if (list !== undefined) {
            const updatedList: List = {
                id: list.id,
                name: list.name,
                items: list.items.map(i => {
                    if (i.id === item.id) {
                        return {
                            id: i.id,
                            text: item.text
                        };
                    } else {
                        return i;
                    }
                })
            };
            const index = lists.indexOf(list);
            const updatedLists = [...lists];
            updatedLists[index] = updatedList;
            onUpdateLists(workspaceId, updatedLists);
        }
    };

    const onFilter = (listId: ListId, items: ListItem[]) => {
        const list = lists.find(l => l.id === listId);
        if (list !== undefined) {
            const updatedList: List = {
                id: list.id,
                name: list.name,
                items: items
            };
            const index = lists.indexOf(list);
            const updatedLists = [...lists];
            updatedLists[index] = updatedList;
            onUpdateLists(workspaceId, updatedLists);
        }
    };

    const onSort = (listId: ListId, items: ListItem[]) => {
        const list = lists.find(l => l.id === listId);
        if (list !== undefined) {
            const updatedList: List = {
                id: list.id,
                name: list.name,
                items: items
            };
            const index = lists.indexOf(list);
            const updatedLists = [...lists];
            updatedLists[index] = updatedList;
            onUpdateLists(workspaceId, updatedLists);
        }
    };

    const onGroup = (listId: ListId, groups: ItemGroup[]) => {
        const list = lists.find(l => l.id === listId);
        if (list !== undefined) {
            const newLists: List[] = groups.map(g => ({
                id: createListId(),
                name: g.name,
                items: g.items.map(i => ({ id: createListItemId(), text: i }))
            }));
            const updatedLists = lists.concat(newLists);
            onUpdateLists(workspaceId, updatedLists);
        }
    };

    const onEditTitle = (listId: ListId, newTitle: string) => {
        const list = lists.find(l => l.id === listId);
        if (list !== undefined) {
            const updatedList: List = {
                id: list.id,
                name: newTitle,
                items: list.items,
            };
            const index = lists.indexOf(list);
            const updatedLists = lists.slice();
            updatedLists[index] = updatedList;
            onUpdateLists(workspaceId, updatedLists);
        }
    };

    const onCreateList = (name: string, items: string[]) => {
        const listItems: ListItem[] = items.map(i => ({ id: createListItemId(), text: i } ));
        const list: List = {
            id: createListId(),
            name: name,
            items: listItems
        };
        const updatedLists = lists.concat(list);
        onUpdateLists(workspaceId, updatedLists);
    };

    const onDeleteList = (listId: ListId) => {
        const updatedLists = lists.filter(l => l.id !== listId);
        onUpdateLists(workspaceId, updatedLists);
    };

    const onUpdateOpenAiKey = (s: string) => {
        localStorage.setItem("openAiKey", s);
    };

    const openAiKey = localStorage.getItem("openAiKey") || "";

    return (
        <>
            <div className="grid-container">
                {lists.map(list => (
                    <div className="grid-item" key={list.id}>
                        <ListElement openAiKey={openAiKey}
                            list={list}
                            addItem={addItem}
                            deleteItem={deleteItem}
                            editItem={editItem}
                            onFilter={onFilter}
                            onSort={onSort}
                            onGroup={onGroup}
                            onDeleteList={onDeleteList}
                            onUpdateItems={onUpdateItems}
                            onEditTitle={onEditTitle}
                            key={list.id}
                        />
                    </div>
                ))}
                <CreateList openAiKey={openAiKey}
                    lists={lists}
                    onCreateList={onCreateList} />
            </div>
            <br />
            <br />
            <br />
            <br />
        </>
    )};

export default WorkspaceContainer;

/*
            OpenAI Key:
            &nbsp;
            <input placeholder="OpenAI key" onChange={e => onUpdateOpenAiKey(e.currentTarget.value)} value={openAiKey} />
*/
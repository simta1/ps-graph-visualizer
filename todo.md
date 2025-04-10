undoStack/redoStack 비었을 때 undo/redo버튼 비활성화 표시하는 게 좋을 듯   

parallel edge 막아야 됨   

일단 undo/redo하면 연결요소 선택 해제되게 해뒀는데 addvertex, addEdge같은거일 때만 해제하게 바꿔야 됨

정점 선택 후 connected component 자동으로 같이 선택해주는 거   
connected component에 대해 트리구조로 나열하거나 원형으로 나열하거나 등등   
connected component에 사이클 포함되어 있는 경우면 그냥 dfs tree 기준으로 나열하면 될듯
아무것도 선택 안한상태에서 하면? 각 연결요소마다 나열해야 되려나

창크기 바꼈을 때 canvas크기 바꾸는 거? 요건 좀 고민해봐야할듯   

간선 가중치 수정 가능하게   
간선 가중치 출력할지말지 설정 가능하게   
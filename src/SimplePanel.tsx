import {PanelProps} from '@grafana/data';
import {stylesFactory, useTheme} from '@grafana/ui';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import 'ag-grid-enterprise';
import {AgGridReact} from 'ag-grid-react';
import _ from 'lodash';
import React from 'react';
import {SimpleOptions} from 'types';
import './style.css';

interface Props extends PanelProps<SimpleOptions> { }

const getStyles = stylesFactory(() => {
  return {
    root: {
      backgroundColor: 'red',
      height: '100%',
      width: '100%',
    },
  };
});

export const SimplePanel: React.FC<Props> = (props: object) => {
  const {data, fieldConfig} = props;
  const theme = useTheme();
  const styles = getStyles();

  // moving the row data to a cleaner hirarchy and converting the buffer to an array.
  let maxIndex = 0;
  const rowData = {};
  data.series[0].fields.forEach((field) => {
    rowData[field.name] = field.values.toArray();
    if (rowData[field.name].length > maxIndex) {
      maxIndex = rowData[field.name].length;
    }
  });

  const API_URL = fieldConfig.defaults.custom.update_api;

  // Dynamically defining the column defenitions

  const shouldEnableFeature = (columnName: string, flag: string) => {
    const override = _.find(fieldConfig.overrides, (f) => f.matcher.options === columnName);
    if (!override) {
      return fieldConfig.defaults.custom[flag] === true;
    }
    const property = _.find(override.properties, (o) => o.id === `custom.${flag}`);
    if (!property) {
      return fieldConfig.defaults.custom[flag] === true;
    } else {
      return property.value === true;
    }
  };

  const onCellEditCallback = (params) => {
    console.log(API_URL);
    fetch(API_URL, {
      method: 'put',
      headers: {'Content-type': 'application/json'},
      body: JSON.stringify({
        id: params.data.id,
        statusCode: params.data.statusCode,
      }),
    }).catch((e) => console.error(e));
  };

  const onExcelExport = () => {
    const params = {
      sheetName: 'grafana_export',
    };
    gridOptions.api.exportDataAsExcel(params);
  };

  const columnDefs = Object.keys(rowData).map((field) => {
    return {
      field,
      resizable: true,
      filter: true,
      editable: shouldEnableFeature(field, 'editable'),
      sortable: true,
      menuTabs: ['filterMenuTab'],
      singleClickEdit: true,
    };
  });

  // TODO: add scrolling
  const formattedRowData = [];
  let index = 0;
  while (index < maxIndex) {
    const row = {};
    Object.keys(rowData).forEach((field) => {
      row[field] = rowData[field][index];
    });
    formattedRowData.push(row);
    index++;
  }

  const gridOptions = {
    columnDefs: columnDefs,
    rowData: formattedRowData,
    defaultColDef: {
      flex: 1,
    },
    suppressDragLeaveHidesColumns: true,
    onCellValueChanged: onCellEditCallback,
  };

  gridOptions.rowStyle = {background: '#2D3F42', color: '#ddd'};

  return (
    <div style={{
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column'}}
    >
      <div className={'ag-theme-alpine'}
        style={{height: '100%', width: '100%', flexGrow: 1}} >
        <AgGridReact gridOptions={gridOptions}>

        </AgGridReact>
      </div >
      <button className='pulse'
        onClick={onExcelExport}
        style={{
          height: '10%',
          width: '10%',
          zIndex: 1000,
          alignSelf: 'center',
          margin: '8px'}}
      />
    </div>
  );
};

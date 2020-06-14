#include <stdio.h>
#include <sys/stat.h>
#include <stdlib.h>
#include <string.h>
#include "cJSON.h"

int writeToCompleted(char* NOTEBOOK_PATH, FILE* flog){
  char* completedPath = malloc(strlen(NOTEBOOK_PATH)+strlen("management/completed.org")+1);
  memcpy(completedPath, NOTEBOOK_PATH, strlen(NOTEBOOK_PATH));
  strcat(completedPath, "/management/completed.org");
  FILE* fCompleted = fopen(completedPath, "a");
  if (fCompleted == NULL){
    fprintf(flog, "Failed to open completed.org");
    return -1;
  }
  fprintf(flog, "Writing into %s", completedPath);
  int ch = fgetc(stdin);
  while (ch != -1){
    fputc(ch, fCompleted);
    ch = fgetc(stdin);
  }
  fclose(fCompleted);
  free(completedPath);
  return 0;
}

int main(void){
  char* home = getenv("HOME");
  char* fpath = strcat(home, "/.emacs-config.json");
  FILE* fp = fopen(fpath, "r");
  FILE* flog = fopen("/var/log/emacs-external/transfer/log.txt", "w");
  if (fp == NULL){
    fprintf(flog, "Failed to open emacs config file.\n");
    return 1;
  }
  struct stat* fpinfo = malloc(sizeof (struct stat));
  if(stat(fpath, fpinfo) == -1){
    fprintf(flog, "Reading emacs config file failed..\n");
    return 1;
  }
  char* contents = malloc(fpinfo->st_size+1);
  int ch = fgetc(fp);
  for(int i = 0; i < (int)fpinfo->st_size; ++i){
    contents[i] = (char)ch;
    ch = fgetc(fp);
  }
  contents[(int)fpinfo->st_size]='\0';
  fprintf(flog, "Contents of the file are: %s\n", contents);
  cJSON* json = cJSON_Parse(contents);
  cJSON* NOTEBOOK_PATH = cJSON_GetObjectItem(json, "NOTEBOOK_PATH");
  fprintf(flog, "Notebook path ought to be %s\n", NOTEBOOK_PATH->valuestring);
  int retval = writeToCompleted(NOTEBOOK_PATH->valuestring, flog);
  if (retval == -1){
    printf("Failed to write into completed.org");
    return 1;
  }
  free(json);
  free(contents);
  free(fpinfo);
  fclose(fp);
  fclose(flog);
  return 0;
}
